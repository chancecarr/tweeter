import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../model.service/StatusService";
import { Presenter, MessageView } from "./Presenter";

export interface PostStatusView extends MessageView {
  setPost: (value: string) => void;
  setIsLoading: (value: boolean) => void;
}

export class PostStatusPresenter extends Presenter<PostStatusView> {
  private currentUser: User;
  private authToken: AuthToken;
  private _statusService = new StatusService();

  public constructor(
    view: PostStatusView,
    currentUser: User,
    authToken: AuthToken,
  ) {
    super(view);
    this.currentUser = currentUser;
    this.authToken = authToken;
  }

  public get statusService() {
    return this._statusService;
  }

  public submitPost = async (event: React.MouseEvent, post: string) => {
    event.preventDefault();

    var postingStatusToastId = "";

    await this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);
      postingStatusToastId = this.view.displayInfoMessage(
        "Posting status...",
        0,
      );

      const status = new Status(post, this.currentUser!, Date.now());

      await this.statusService.postStatus(this.authToken!, status);

      this.view.setPost("");
      this.view.displayInfoMessage("Status posted!", 2000);
    }, "post the status");
    this.view.deleteMessage(postingStatusToastId);
    this.view.setIsLoading(false);
  };

  public clearPost(event: React.MouseEvent) {
    event.preventDefault();
    this.view.setPost("");
  }

  public checkButtonStatus = (post: string): boolean => {
    return !post.trim() || !this.authToken || !this.currentUser;
  };
}
