import QuestionCard from '@/components/cards/QuestionCard'
import NoResult from '@/components/shared/NoResult'
import LocalSearch from '@/components/shared/search/LocalSearch'

import { getQuestionByTagId } from '@/lib/actions/tag.actions'
import { URLProps } from '@/types'
import React from 'react'

export  async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: Record<string, string | undefined>;
}) {
    const result = await getQuestionByTagId({
        tagId: params.id,
        searchQuery : searchParams.q
    })
    console.log(result);
  return (

    <>
    <h1 className="h1-bold text-dark100_light900"> {result.tagTitle}</h1>
    <div className="mt-11 w-full">
      <LocalSearch
        route="/collection"
        iconPosition="left"
        imgSrc="/assets/icons/search.svg"
        placeholder="Search for tag questions"
        otherClasses="flex-1"
      />
      
    </div>
    <div className="mt-10 flex w-full flex-col gap-6">
      {result.questions?.length > 0 ? (
        result.questions.map((question: any) => (
          <QuestionCard
                key={question._id}
                _id={question._id}
                title={question.title}
                tags={question.tags}
                author={question.author}
                upvotes={question.upvotes}
                views={question.views}
                createdAt={question.createdAt} answers={[]}          />
        ))
      ) : (
        <NoResult 
          title="There’s no tag questions to show"
          description="Be the first to break the silence! 🚀 Ask a Question and kickstart the discussion. Your query could be the next big thing others learn from. Get involved! 💡"
          link="/ask-question"
          linktitle="Ask a Question"
        />
      )}
    </div>
    <div className="mt-10">
      
    </div>
  </>
  )

}

export default Page