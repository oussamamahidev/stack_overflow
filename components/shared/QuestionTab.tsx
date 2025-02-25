import { getUserQuestion } from '@/lib/actions/user.action';
import { SearchParamsProps, SearchParamsPropss } from '@/types';
import React from 'react'
import QuestionCard from '../cards/QuestionCard';
interface Props extends SearchParamsPropss {
  userId: string;
  clerkId?: string | null;
  
}
const QuestionTab = async ({searchParams,userId,clerkId} : Props) => {

  const result = await getUserQuestion({
    userId
  })
  console.log(result);
  return (
    <>
    {result.questions.map(question =>(
      <QuestionCard 
      key={question._id}
      _id={question._id} 
      clerkId={clerkId}
      title={question.title}
      tags={question.tags}
      author={question.author}
      upvotes={question.upvotes}
      downvotes={question.downvotes}
      views={question.views}
      answers={question.answers}
      createdAt={question.createdAt}
      />
    ))}
    </>
  )
}

export default QuestionTab