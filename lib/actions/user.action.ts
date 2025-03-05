"use server";

import {FilterQuery} from "mongoose"
import User from "@/database/user.model";
import { connectToDatabase } from "../mongoose";
import {
  CreateUserParams,
  DeleteUserParams,
  GetAllUsersParams,
  UpdateUserParams,
  GetUserByIdParams,
  ToggleSaveQuestionParams,
  GetSavedQuestionsParams,
  GetUserStatsParams,
} from "./shared.types";
import { revalidatePath } from "next/cache";
import Question from "@/database/question.model";
import Tag from "@/database/tag.model";
import Answer from "@/database/answer.model";
import { pages } from "next/dist/build/templates/app-page";

export async function getUserById(params: GetUserByIdParams) {
  try {
    console.log('user being called')
    await connectToDatabase(); // FIX: Await database connection

    const { userId } = params;
    const user = await User.findOne({ clerkId: userId });

    return user;
  } catch (error) {
    console.error("🔴 Error fetching user by ID:", error);
    throw error;
  }
}

export async function createUser(userParam: CreateUserParams) {
  try {
    console.log('Creating user')
    await connectToDatabase(); // FIX: Await database connection

    const newUser = await User.create(userParam);
    return newUser;
  } catch (error) {
    console.error("🔴 Error creating user:", error);
    throw error;
  }
}

export async function updateUser(params: UpdateUserParams) {
  try {
    console.log("Updating user")
    await connectToDatabase(); // FIX: Await database connection

    const { clerkId, updateData, path } = params;
    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    revalidatePath(path);
    return updatedUser;
  } catch (error) {
    console.error("🔴 Error updating user:", error);
    throw error;
  }
}

export async function deleteUser(userParam: DeleteUserParams) {
  try {
    await connectToDatabase(); // FIX: Await database connection

    const { clerkId } = userParam;
    const user = await User.findOneAndDelete({ clerkId }); // FIX: Use findOneAndDelete instead of findByIdAndDelete

    if (!user) {
      throw new Error("User not found");
    }

    // Delete all questions associated with this user
    await Question.deleteMany({ author: user._id });

    console.log("✅ User and related questions deleted successfully.");
    return user;
  } catch (error) {
    console.error("🔴 Error deleting user:", error);
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function getAllUsers(params: GetAllUsersParams) {
  try {
    await connectToDatabase(); 

    connectToDatabase();
    const { searchQuery, filter, page = 1, pageSize =10} = params;
    const skipAmount = (page - 1) * pageSize;
    const query: FilterQuery<typeof User> = {};
    if (searchQuery) {
      query.$or = [
        { name: { $regex: new RegExp(searchQuery, "i") } },
        { username: { $regex: new RegExp(searchQuery, "i") } },
      ];
    }
    let sortOptions = {};
    switch (filter) {
      case "new_users":
        sortOptions = { joinedAt: -1 };
        break;
      case "old_users":
        sortOptions = { joinedAt: 1 };
        break;
      case "top_contributors":
        sortOptions = { reputation: -1 };
        break;
      default:
        break;
    }
    const users = await User.find(query)
    .skip(skipAmount)
      .limit(pageSize)
      .sort(sortOptions);
      
    const totalUsers = await User.countDocuments(query);
    const isNext = totalUsers > skipAmount + users.length;
    return { users, isNext };
  } catch (error) {
    console.error("🔴 Error fetching all users:", error);
    throw error;
  }
}

export async function generateUniqueUsername(firstName: string | null, lastName: string | null) {
  // Create base username from full name
  const baseUsername = `${firstName}${lastName ? lastName : ''}`
    .toLowerCase()
    .replace(/\s+/g, '') // Remove spaces
    .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
  
  let username = baseUsername
  let counter = 1

  // Keep checking until we find a unique username
  while (true) {
    // Check if username exists in database
    const existingUser = await User.findOne({ username })
    
    if (!existingUser) {
      return username
    }

    // If username exists, append counter and try again
    username = `${baseUsername}${counter}`
    counter++
  }
}


export async function toggleSaveQuestion(params: ToggleSaveQuestionParams){

  try{
    connectToDatabase();
    const {userId, questionId,path } = params;
    const user = await User.findById(userId);
    if(!user){
      throw new Error("user not found");
    }
    const isQuestionSeved= user.saved.includes(questionId);
    if(isQuestionSeved){
      await User.findByIdAndUpdate(userId,
        {$pull : {saved: questionId}},
        {new: true}
      )
    }else{
      await User.findByIdAndUpdate(userId,
        {$addToSet : {saved: questionId}},
        {new: true}
      )
    }
    revalidatePath(path);
  }catch(err){ 
    console.log(err);
    throw err;
  }
}

export async function getSavedQuestions(params: GetSavedQuestionsParams) {
  try {
    connectToDatabase();
    const { clerkId, searchQuery, filter, page = 1, pageSize = 1 } = params;
    const skipAmount = (page - 1) * pageSize;
    const query: FilterQuery<typeof Question> = searchQuery
      ? { title: { $regex: new RegExp(searchQuery, "i") } }
      : {};
    let sortOptions = {};
    switch (filter) {
      case "most_recent":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "most_voted":
        sortOptions = { upvotes: -1 };
        break;
      case "most_viewed":
        sortOptions = { views: -1 };
        break;
      case "most_answered":
        sortOptions = { answers: -1 };
        break;
      default:
        break;
    }
    const user = await User.findOne({ clerkId }).populate({
      path: "saved",
      match: query,
      options: {
        sort: sortOptions,
        skip: skipAmount,
        limit: pageSize + 1,
      },
      populate: [
        { path: "tags", model: Tag, select: "_id name" },
        { path: "author", model: User, select: "_id clerkId name picture" },
      ],
    });
    if (!user) {
      throw new Error("User not found");
    }
    const isNext = user.saved.length > pageSize;
    const savedQuestions = user.saved;
    return { questions: savedQuestions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export async function getUserInfo (params: GetUserByIdParams){

  try{
    connectToDatabase();
    const {userId}=params;
    const user = await User.findOne({clerkId: userId});

    if(!user){
      throw new Error("User not Found");
    }
    const totalQuestions = await Question.countDocuments({
      author: user._id
    })

    const totalAnswers = await Answer.countDocuments({
      author: user._id
    })

    return{
      user,
      totalQuestions,
      totalAnswers
    }
  }catch(err){
    console.log(err);
    throw err;
  }
}

export async function getUserQuestion (params: GetUserStatsParams){

  try {
    connectToDatabase();
    const { userId, page = 1, pageSize = 1 } = params;
    const skipAmount = (page - 1) * pageSize;
    const totalQuestions = await Question.countDocuments({ author: userId });
    const userQuestions = await Question.find({ author: userId })
      .sort({ createdAt: -1, views: -1, upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate("tags", "_id name")
      .populate("author", "_id clerkId name picture");
    const isNext = totalQuestions > skipAmount + userQuestions.length;
    return { totalQuestions, questions: userQuestions, isNext };
  } catch (error) {
    console.log(error);
    throw error;
  }
} 

export async function getUserAnswers (params: GetUserStatsParams){

  try {
    connectToDatabase();
    const { userId, page = 1, pageSize = 5 } = params;
    const skipAmount = (page - 1) * pageSize;
    const totalAnswers = await Answer.countDocuments({ author: userId });
    const userAnswers = await Answer.find({ author: userId })
      .sort({ upvotes: -1 })
      .skip(skipAmount)
      .limit(pageSize)
      .populate("question", "_id title")
      .populate("author", "_id clerkId name picture");
    const isNext = totalAnswers > skipAmount + userAnswers.length;
    return { totalAnswers, answers: userAnswers, isNext};
  } catch (error) {
    console.log(error);
    throw error;
  }
}

