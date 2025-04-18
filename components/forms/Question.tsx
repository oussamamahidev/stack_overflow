"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Editor } from "@tinymce/tinymce-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "../ui/badge"
import Image from "next/image"
import { QuestionSchema } from "@/lib/validation"

import { createQuestion, editQuestion } from "@/lib/actions/question.action"
import { useRouter, usePathname } from "next/navigation"
import { useTheme } from "@/context/ThemeProvider"

interface Props {
  type?: string
  mongoUserId: string
  questionDetails?: string
}

const Question = ({ type = "create", mongoUserId, questionDetails }: Props) => {
  const editorRef = useRef<any>(null)
  const { mode } = useTheme()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const router = useRouter()
  const pathname = usePathname()

  const parsedQuestionDetails = questionDetails ? JSON.parse(questionDetails ?? "{}") : {}

  const groupedTags = parsedQuestionDetails?.tags?.map((tag: any) => tag.name)
  const form = useForm<z.infer<typeof QuestionSchema>>({
    resolver: zodResolver(QuestionSchema),
    defaultValues: {
      title: parsedQuestionDetails?.title ?? "",
      explanation: parsedQuestionDetails?.content ?? "",
      tags: groupedTags ?? [],
    },
  })

  async function onSubmit(values: z.infer<typeof QuestionSchema>) {
    setIsSubmitting(true)
    try {
      if (type === "edit") {
        await editQuestion({
          questionId: parsedQuestionDetails._id,
          title: values.title,
          content: values.explanation,
          path: pathname,
        })
        router.push(`/question/${parsedQuestionDetails._id}`)
      } else {
        await createQuestion({
          title: values.title,
          content: values.explanation,
          tags: values.tags,
          author: JSON.parse(mongoUserId),
          path: pathname,
        })
        router.push("/")
      }
    } catch (error) {
      console.log(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: any) => {
    if (e.key === "Enter" && field.name === "tags") {
      e.preventDefault()
      const tagInput = e.target as HTMLInputElement
      const tagValue = tagInput.value.trim()

      if (tagValue !== "") {
        if (tagValue.length > 15) {
          return form.setError("tags", {
            type: "required",
            message: "Tag must be less than 15 characters.",
          })
        }
        if (!field.value.includes(tagValue)) {
          form.setValue("tags", [...field.value, tagValue])
          tagInput.value = ""
          form.clearErrors("tags")
        } else {
          form.trigger()
        }
      }
    }
  }

  const handelTagRemove = (tag: string, field: any) => {
    const newTags = field.value.filter((t: string) => t !== tag)
    form.setValue("tags", newTags)
  }

  return (
    <>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-10">
        {/* Question Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Question Title <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl className="mt-3.5">
                <Input
                  className="no-focus paragraph-regular background-light800_dark300 light-border-2 text-dark300_light700 min-h-[56px] border rounded-xl"
                  {...field}
                />
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                Be specific and imagine you&apos;re asking a question to another person.
              </FormDescription>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="explanation"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-3">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Detailed explanation of your problem?
                <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl className="mt-3.5">
                <Editor
                  apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                  onInit={(evt, editor) => {
                    editorRef.current = editor
                  }}
                  onBlur={field.onBlur}
                  onEditorChange={(content) => field.onChange(content)}
                  initialValue={parsedQuestionDetails?.content ?? ""}
                  init={{
                    height: 350,
                    menubar: false,
                    plugins: [
                      "advlist",
                      "autolink",
                      "lists",
                      "link",
                      "image",
                      "charmap",
                      "preview",
                      "anchor",
                      "searchreplace",
                      "visualblocks",
                      "codesample",
                      "fullscreen",
                      "insertdatetime",
                      "media",
                      "table",
                    ],
                    toolbar:
                      "undo redo | codesample | " +
                      "bold italic forecolor | alignleft aligncenter " +
                      "alignright alignjustify | bullist numlist",
                    content_style: "body { font-family:Inter; font-size:16px }",
                    skin: mode === "dark" ? "oxide-dark" : "oxide",
                    content_css: mode === "dark" ? "dark" : "light",
                  }}
                />
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                Introduce the problem and expand on what you put in the title. Minimum 20 characters.
              </FormDescription>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem className="flex w-full flex-col">
              <FormLabel className="paragraph-semibold text-dark400_light800">
                Tags <span className="text-primary-500">*</span>
              </FormLabel>
              <FormControl className="mt-3.5">
                <>
                  <Input
                    disabled={type === "edit"}
                    className="no-focus paragraph-regular background-light800_dark300 light-border-2 text-dark300_light700 min-h-[56px] border rounded-xl"
                    placeholder="Add tags..."
                    onKeyDown={(e) => handleInputKeyDown(e, field)}
                  />
                  {field.value.length > 0 ? (
                    <div className="flex-start mt-2.5 gap-2.5">
                      {field.value.map((tag: string) => (
                        <Badge
                          key={tag}
                          className={`subtle-medium background-light800_dark300 text-light400_light500 flex items-center justify-center gap-2 rounded-xl border-none px-4 py-2 capitalize ${
                            type === "edit" ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                          onClick={() => handelTagRemove(tag, field)}
                        >
                          {tag}
                          {type !== "edit" ? (
                            <Image
                              src="/assets/icons/close.svg"
                              alt="close icon"
                              width={12}
                              height={12}
                              className={`${
                                type === "edit" ? "cursor-not-allowed" : "cursor-pointer"
                              } object-contain invert-0 dark:invert`}
                            />
                          ) : null}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </>
              </FormControl>
              <FormDescription className="body-regular mt-2.5 text-light-500">
                Add up to 3 tags to describe what your question is about. Start typing to see suggestions.
              </FormDescription>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="primary-gradient w-fit !text-light-900 rounded-xl px-6 py-3 shadow-sm hover:shadow-md transition-all duration-300"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>{type === "edit" ? "Editing..." : "Posting..."}</>
          ) : (
            <>{type === "edit" ? "Edit Question" : "Post Question"}</>
          )}
        </Button>
      </form>
    </Form>
  </>
  )
}

export default Question

