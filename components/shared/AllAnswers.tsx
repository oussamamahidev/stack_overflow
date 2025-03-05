/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import Filter from './Filter';
import { AnswerFilters } from '@/constants/filters';
import { getAnswers } from '@/lib/actions/answer.action';
import Link from 'next/link';
import Image from 'next/image';
import { getTimestamp } from '@/lib/utils';
import ParseHTML from './ParseHtml';
import Votes from './Votes';
import Pagination from './search/Pagination';


interface Props {
    questionId:string;
    userId:string;
    totalANswers: string;
    page?:string;
    filter?:string;
     
}
const AllAnswers = async ({questionId  ,totalANswers,userId,filter,page }: Props) => {

    const result= await getAnswers({
        questionId,
        page: page ?-page:1,
        sortBy: filter,
    });
  return (
    <div className='mt-11'>
        <div className='flex items-center justify-between'>
            <h3 className='primary-text-gradient'>{totalANswers} Answers</h3>

            <Filter filters={AnswerFilters}/>
        </div>
        <div className=''>
            {result.answers.map((answer) =>(
                <article key={answer._id} className='light-border border-b py-10'>
                    <div className='flex-items-center justify-between'>
                        <div className='mb-8 flex flex-col-reverse justify-between
                        gap-5 sm:flex-row sm:items-center sm:gap-2'>
                            <Link href={`/profile/${answer.author.clerkId}`} 
                            className='flex flex-1 items-start gap-1 sm:items-center '>
                                <Image 
                                    src={answer.author.picture}
                                    alt='profile'
                                    width={18}
                                    height={18}
                                    className='rounded-full object-cover max-sm:mt-0.5'
                                />
                                <div className='flex flex-col sm:flex-row sm:items-center'>

                                    <p className='body-semibold text-dark300_light700'>{answer.author.name}</p>
                                    <p className='small-regular text-light400_light500
                                    mt-0.5 line-clamp-1 ml-0.5'>
                                        <span className='max-sm:hidden'>{" "}-</span>
                                    answered {"  "} {getTimestamp(answer.createdAt)}
                                    </p>
                                </div>
                            
                            </Link>
                            <div className='flex justify-end'>
                            <Votes
                                type="Answer"
                                itemId={JSON.stringify(answer._id)}
                                userId={JSON.stringify(userId)}
                                upvotes={answer.upvotes.length}
                                hasAlreadyUpvoted={answer.upvotes.includes(userId)}
                                downvotes={answer.downvotes.length}
                                hasAlreadyDownvoted={answer.downvotes.includes(userId)}
                            />
                                
                            </div>
                        </div>
                       
                    </div>
                    <ParseHTML data={answer.content}/>
                </article>
            ))}
            <div className="mt-10 w-full">
      <Pagination 
        pageNumber={page ? + page :1}
        isNext={result.isNext|| false}
      />
      </div>

        </div>
    </div>
  )
}

export default AllAnswers;