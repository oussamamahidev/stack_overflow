import { Button } from "@/components/ui/button";
import Link from "next/link";
import LocalSearch from "@/components/shared/search/LocalSearch";

import Filter from "@/components/shared/Filter";
import { HomePageFilters } from "@/constants/filters";
import HomeFilers from "@/components/home/HomeFilers";
import NoResult from "@/components/shared/NoResult";
import QuestionCard from "@/components/cards/QuestionCard";
import { getQuestions } from "@/lib/actions/question.action";


interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}
export default async  function Home({searchParams}:HomePageProps) {
  
  const {q,filter}= await searchParams;
  const { questions } = await getQuestions({
    searchQuery: q,
    filter: filter
  });
  return (
    <>
      <div className="flex w-full flex-col-reverse justify-between gap-4 sm:flex-row sm:items-center" >
        <h1 className="h1-bold text-dark100_light900">All Questions</h1>
        <Link href='/ask-question' className="flex justify-end max-sm:w-full">
          <Button className="primary-gradient min-h-[46px] px-4 py-3 !text-light-900 rounded">
            Ask a Question
          </Button>
        </Link>
      </div>
      <div className="mt-11 flex justify-between gap-5 max-sm:flex-col sm:items-center">
        <LocalSearch 
        route='/'
        iconPosition="left"
        imgSrc="/assets/icons/search.svg"
        placeholder="Search for questions..."
        otherClasses="flex-1"

        />
        <Filter
          filters={HomePageFilters}
          otherClasses="min-h-[56px] sm:min-w-[170px]"
          containerClasses="hidden max-md:flex"
        />
      </div>
      <div className="hidden md:flex">
      <HomeFilers />
      </div>
      
      <div className="mt-10 flex w-full flex-col gap-6 ">

        {questions.length>0 ?
        questions.map((question) =>(
          <QuestionCard 
          key={question._id}
          _id={question._id}
          title={question.title}
          tags={question.tags}
          author={question.author}
          upvotes={question.upvotes}
          downvotes={question.downsvotes}
          views={question.views}
          answers={question.answers}
          createdAt={question.createdAt}
          />
        ))
        :<NoResult
        title= " There's no question to show"
        description= " Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. our query could be the next big thing others learn from. Get involved! 💡"
        link="/ask-question"
        linktitle='Ask a Question'
        />
      }
      </div>
    </>
  );
}
