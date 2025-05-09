"use server";

import Question from "@/database/question.model";
import { connectToDatabase } from "../mongoose";
import Tag from "@/database/tag.model";
import type {
  CreateQuestionParams,
  DeleteQuestionParams,
  EditQuestionParams,
  GetQuestionByIdParams,
  GetQuestionsParams,
  QuestionVoteParams,
  RecommendedParams,
} from "./shared.types";
import User from "@/database/user.model";
import { revalidatePath } from "next/cache";
import Answer from "@/database/answer.model";
import Interaction from "@/database/interaction.model";
import type { FilterQuery } from "mongoose";

export async function getQuestions(params: GetQuestionsParams) {
  try {
    connectToDatabase();

    const { searchQuery, filter, page = 1, pageSize = 20 } = params;

    const skipAmount = (page - 1) * pageSize;

    const query: any = {};

    if (searchQuery) {
      query.$or = [
        { title: { $regex: new RegExp(searchQuery, "i") } },
        { content: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }

    let sortOptions = {};

    switch (filter) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "frequent":
        sortOptions = { views: -1 };
        break;
      case "unanswered":
        query.answers = { $size: 0 };
        break;
      default:
        break;
    }

    const totalQuestions = await Question.countDocuments(query);

    const questions = await Question.find(query)
      .populate({ path: "tags", model: Tag })
      .populate({ path: "author", model: User })
      .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);

    const isNext = totalQuestions > skipAmount + questions.length;

    return { questions, isNext };
  } catch (error) {
    console.error("Error getting questions:", error);
    throw error;
  }
}

export async function createQuestion(params: CreateQuestionParams) {
  try {
    connectToDatabase();
    const { title, content, tags, author, path } = params;
    // Create the question
    const question = await Question.create({
      title,
      content,
      author,
    });
    const tagDocuments = [];
    // Create the tags or get them if they already exist
    for (const tag of tags) {
      const existingTag = await Tag.findOneAndUpdate(
        { name: { $regex: new RegExp(`^${tag}$`, "i") } },
        { $setOnInsert: { name: tag }, $push: { questions: question._id } },
        { upsert: true, new: true }
      );
      tagDocuments.push(existingTag._id);
    }
    await Question.findByIdAndUpdate(question._id, {
      $push: { tags: { $each: tagDocuments } },
    });

    await Interaction.create({
      user: author,
      action: "ask_question",
      question: question._id,
      tags: tagDocuments,
    });
    // Increment author's reputation by +5 for creating a question
    await User.findByIdAndUpdate(author, { $inc: { reputation: 5 } });
    revalidatePath(path);
  } catch (err) {
    console.error("Error creating question:", err);
    throw err;
  }
}

export async function getQuestionById(params: GetQuestionByIdParams) {
  try {
    await connectToDatabase();
    const { questionId } = params;

    const question = await Question.findById(questionId)
      .populate({ path: "tags", model: Tag, select: "_id name" })
      .populate({
        path: "author",
        model: User,
        select: "_id clerkId name picture",
      })
      // Add this line to populate the answers array
      .populate({
        path: "answers",
        model: "Answer",
        populate: {
          path: "author",
          model: User,
          select: "_id clerkId name picture",
        },
      });

    if (!question) {
      throw new Error("Question not found");
    }

    // Increment view count
    await Question.findByIdAndUpdate(questionId, { $inc: { views: 1 } });

    return question;
  } catch (err) {
    console.error("Error getting question by ID:", err);
    throw err;
  }
}

export async function upvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();
    const { questionId, userId, hasAlreadyUpvoted, hasAlreadyDownvoted, path } =
      params;
    let updateQuery = {};
    if (hasAlreadyUpvoted) {
      updateQuery = { $pull: { upvotes: userId } };
    } else if (hasAlreadyDownvoted) {
      updateQuery = {
        $pull: { downvotes: userId },
        $push: { upvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { upvotes: userId } };
    }
    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });
    if (!question) {
      throw new Error("Question not found");
    }
    //increment author reputation by -10 for upvoting a question
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasAlreadyUpvoted ? -2 : 2 },
    });

    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasAlreadyUpvoted ? -10 : 10 },
    });
    revalidatePath(path);
  } catch (err) {
    console.error("Error upvoting question:", err);
    throw err;
  }
}

export async function downvoteQuestion(params: QuestionVoteParams) {
  try {
    connectToDatabase();
    const { questionId, userId, hasAlreadyUpvoted, hasAlreadyDownvoted, path } =
      params;
    let updateQuery = {};
    if (hasAlreadyDownvoted) {
      // Fixed: Changed 'downvote' to 'downvotes'
      updateQuery = { $pull: { downvotes: userId } };
    } else if (hasAlreadyUpvoted) {
      updateQuery = {
        $pull: { upvotes: userId },
        $push: { downvotes: userId },
      };
    } else {
      updateQuery = { $addToSet: { downvotes: userId } };
    }
    const question = await Question.findByIdAndUpdate(questionId, updateQuery, {
      new: true,
    });
    if (!question) {
      throw new Error("Question not found");
    }

    // Increment user's reputation
    await User.findByIdAndUpdate(userId, {
      $inc: { reputation: hasAlreadyDownvoted ? -2 : 2 },
    });
    await User.findByIdAndUpdate(question.author, {
      $inc: { reputation: hasAlreadyDownvoted ? -10 : 10 },
    });
    revalidatePath(path);
  } catch (err) {
    console.error("Error downvoting question:", err);
    throw err;
  }
}

export async function deleteQuestion(params: DeleteQuestionParams) {
  try {
    connectToDatabase();
    const { questionId, path } = params;
    await Question.deleteOne({
      _id: questionId,
    });
    await Answer.deleteMany({ question: questionId });
    await Interaction.deleteMany({ question: questionId });
    await Tag.updateMany(
      {
        questions: questionId,
      },
      {
        $pull: { questions: questionId },
      }
    );
    revalidatePath(path);
  } catch (err) {
    console.error("Error deleting question:", err);
    throw err;
  }
}

export async function editQuestion(params: EditQuestionParams) {
  try {
    connectToDatabase();
    const { questionId, title, content, path } = params;
    const question = await Question.findById(questionId).populate("tags");
    if (!question) {
      throw new Error("Question not found");
    }
    question.title = title;
    question.content = content;
    await question.save();
    revalidatePath(path);
  } catch (error) {
    console.error("Error editing question:", error);
    throw error;
  }
}

export async function getHotQuestions() {
  try {
    connectToDatabase();
    const hotQuestions = await Question.find({})
      .sort({ views: -1, upvotes: -1 }) //descending order
      .limit(5);
    return JSON.parse(JSON.stringify(hotQuestions));
  } catch (err) {
    console.error("Error getting hot questions:", err);
    throw err;
  }
}

export async function getRecommendedQuestions(params: RecommendedParams) {
  try {
    await connectToDatabase();
    const { userId, page = 1, pageSize = 10, searchQuery } = params;
    // find user
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new Error("user not found");
    }
    const skipAmount = (page - 1) * pageSize;
    // Find the user's interactions
    const userInteractions = await Interaction.find({ user: user._id })
      .populate("tags")
      .exec();
    // Extract tags from user's interactions
    const userTags = userInteractions.reduce((tags, interaction) => {
      if (interaction.tags) {
        tags = tags.concat(interaction.tags);
      }
      return tags;
    }, []);
    // Get distinct tag IDs from user's interactions
    const distinctUserTagIds = [
      // @ts-ignore
      ...new Set(userTags.map((tag: any) => tag._id)),
    ];
    const query: FilterQuery<typeof Question> = {
      $and: [
        { tags: { $in: distinctUserTagIds } }, // Questions with user's tags
        { author: { $ne: user._id } }, // Exclude user's own questions
      ],
    };
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { content: { $regex: searchQuery, $options: "i" } },
      ];
    }
    const totalQuestions = await Question.countDocuments(query);
    const recommendedQuestions = await Question.find(query)
      .populate({
        path: "tags",
        model: Tag,
      })
      .populate({
        path: "author",
        model: User,
      })
      .skip(skipAmount)
      .limit(pageSize);
    const isNext = totalQuestions > skipAmount + recommendedQuestions.length;
    return JSON.parse(
      JSON.stringify({ questions: recommendedQuestions, isNext })
    );
  } catch (error) {
    console.error("Error getting recommended questions:", error);
    throw error;
  }
}

export async function getFeaturedQuestions() {
  try {
    await connectToDatabase();

    // Find questions with the most upvotes and views
    const featuredQuestions = await Question.find({})
      .populate({
        path: "tags",
        model: Tag,
      })
      .populate({
        path: "author",
        model: User,
      })
      .sort({ upvotes: -1, views: -1 })
      .limit(5);

    // If we found questions, return them
    if (featuredQuestions.length > 0) {
      return JSON.parse(JSON.stringify(featuredQuestions));
    }

    // If no questions were found, create a fallback question
    // This is just for development/testing - in production you might want to handle this differently
    console.log("No featured questions found, returning empty array");
    return [];
  } catch (error) {
    console.error("Error fetching featured questions:", error);
    return [];
  }
}
