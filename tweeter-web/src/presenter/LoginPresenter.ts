import { UserService } from "../model.service/UserService";
import { Presenter, AuthView } from "./Presenter";

export interface LoginView extends AuthView {}

export class LoginPresenter extends Presenter<LoginView> {
  private originalUrl: string | null;
  private userService = new UserService();

  public constructor(view: LoginView, originalUrl?: string) {
    super(view);
    this.originalUrl = originalUrl ?? null;
  }

  public async doLogin(alias: string, password: string, rememberMe: boolean) {
    await this.doFailureReportingOperation(async () => {
      await this.doAuthOperation(
        async () => {
          return this.userService.login(alias, password);
        },
        () => {
          if (!!this.originalUrl) {
            this.view.navigate(this.originalUrl);
          } else {
            this.view.navigate(`/feed/${alias}`);
          }
        },
        this.view,
        rememberMe,
      );
    }, "log user in");
  }
}
