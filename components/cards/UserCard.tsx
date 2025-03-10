
import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";
import RenderTag from "../shared/RenderTag";
import { getTopInterectedTags } from "@/lib/actions/tag.actions";

interface Props{
  user: {
  _id: string,
  clerckId: string,
  picture: string,
  name: string,
  username: string
 }
}
const UserCard = async ({user}: Props) => {
const interactedTags = await getTopInterectedTags({
  userId: user._id
});
  return (
    <Link
      href={`/profile/${user.clerckId}`}
      className="shadow-light100_darknone w-full max-xs:min-w-full xs:w-[260px]"
    >
      <article className="background-light900_dark200 light-border flex w-full flex-col items-center justify-between rounded-xl border p-8 transition-all duration-300 hover:shadow-md h-[320px]">
        <Image
          src={user.picture || "/placeholder.svg"}
          alt="user profile picture"
          width={100}
          height={100}
          className="rounded-full border-2 border-primary-500/20"
        />

        <div className="mt-4 text-center">
          <h3 className="h3-bold text-dark200_light900 line-clamp-1">{user.name}</h3>
          <p className="body-regular text-dark500_light500 mt-2">@{user.username}</p>
        </div>

        <div className="mt-auto">
          {interactedTags.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-2">
              {interactedTags.map((tag) => (
                <RenderTag key={tag._id} _id={tag._id} name={tag.name} />
              ))}
            </div>
          ) : (
            <Badge className="subtle-medium background-light800_dark300 text-light400_light500 rounded-xl border-none px-4 py-2">
              No tags yet
            </Badge>
          )}
        </div>
      </article>
    </Link>
  );
};

export default UserCard;