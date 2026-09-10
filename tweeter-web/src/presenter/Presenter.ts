import { NavigateFunction } from "react-router-dom";
import { AuthToken, User } from "tweeter-shared";
import { UserInfoView } from "./UserInfoPresenter";

export interface View {
  displayErrorMessage: (message: string) => void;
}

export interface MessageView extends View {
  displayInfoMessage: (message: string, duration: number) => string;
  deleteMessage: (messageId: string) => void;
}

export interface AuthView extends View {
  updateUserInfo: (
    currentUser: User,
    displayedUser: User | null,
    authToken: AuthToken,
    remember: boolean,
  ) => void;
  navigate: NavigateFunction;
  setIsLoading: (isLoading: boolean) => void;
}

export abstract class Presenter<V extends View> {
  private _view: V;

  public constructor(view: V) {
    this._view = view;
  }

  protected get view() {
    return this._view;
  }

  protected async doFailureReportingOperation(
    operation: () => Promise<void>,
    operationDescription: string,
  ) {
    try {
      await operation();
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to ${operationDescription} because of exception: ${(error as Error).message}`,
      );
    }
  }

  protected async doAuthOperation(
    authOperation: () => Promise<[User, AuthToken]>,
    navOperation: () => void,
    view: AuthView,
    rememberMe: boolean,
  ) {
    view.setIsLoading(true);
    const [user, authToken] = await authOperation();
    view.updateUserInfo(user, user, authToken, rememberMe);
    navOperation();
    view.setIsLoading(false);
  }

  protected async doFollowOperation(
    followOperation: () => Promise<[number, number]>,
    operationDescription: string,
    displayedUser: User,
    view: UserInfoView,
  ) {
    var followOperationToast = "";

    view.setIsLoading(true);
    followOperationToast = view.displayInfoMessage(
      `${operationDescription} ${displayedUser!.name}...`,
      0,
    );

    const [followerCount, followeeCount] = await followOperation();

    view.setIsFollower(operationDescription == "Following");
    view.setFollowerCount(followerCount);
    view.setFolloweeCount(followeeCount);
    view.deleteMessage(followOperationToast);
    view.setIsLoading(false);
  }
}
