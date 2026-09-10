import "./PostStatus.css";
import { useRef, useState } from "react";
import { useMessageActions } from "../toaster/MessageHooks";
import { useUserInfo } from "../userInfo/UserInfoActions";
import {
  PostStatusPresenter,
  PostStatusView,
} from "../../presenter/PostStatusPresenter";

interface Props {
  presenter?: PostStatusPresenter;
}

const PostStatus = (props: Props) => {
  const { displayInfoMessage, displayErrorMessage, deleteMessage } =
    useMessageActions();

  const { currentUser, authToken } = useUserInfo();
  const [post, setPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const listener: PostStatusView = {
    displayInfoMessage,
    displayErrorMessage,
    deleteMessage,
    setPost,
    setIsLoading,
  };

  const presenterRef = useRef<PostStatusPresenter | null>(null);

  if (!presenterRef.current) {
    presenterRef.current =
      props.presenter ??
      new PostStatusPresenter(listener, currentUser!, authToken!);
  }

  return (
    <form>
      <div className="form-group mb-3">
        <textarea
          className="form-control"
          id="postStatusTextArea"
          aria-label="postStatusTextArea"
          rows={10}
          placeholder="What's on your mind?"
          value={post}
          onChange={(event) => {
            setPost(event.target.value);
          }}
        />
      </div>
      <div className="form-group">
        <button
          id="postStatusButton"
          aria-label="postStatusButton"
          className="btn btn-md btn-primary me-1"
          type="button"
          disabled={presenterRef.current!.checkButtonStatus(post)}
          style={{ width: "8em" }}
          onClick={(event) => presenterRef.current!.submitPost(event, post)}
        >
          {isLoading ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <div>Post Status</div>
          )}
        </button>
        <button
          id="clearStatusButton"
          aria-label="clearStatusButton"
          className="btn btn-md btn-secondary"
          type="button"
          disabled={presenterRef.current!.checkButtonStatus(post)}
          onClick={(event) =>
            isLoading || presenterRef.current!.clearPost(event)
          }
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default PostStatus;
