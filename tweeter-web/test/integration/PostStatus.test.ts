import "isomorphic-fetch";
import { StatusService } from "../../src/model.service/StatusService";
import { ServerFacade } from "../../src/network/ServerFacade";
import { mock, instance, verify } from "@typestrong/ts-mockito";
import {
  PostStatusView,
  PostStatusPresenter,
} from "../../src/presenter/PostStatusPresenter";
import { User, AuthToken } from "tweeter-shared";

describe("PostStatus integration", () => {
  let user: User;
  let authToken: AuthToken;
  let postStatusPresenter: PostStatusPresenter;
  let mockPostStatusPresenterView: PostStatusView;

  const serverFacade = ServerFacade.getInstance();
  const statusService = new StatusService();

  beforeAll(async () => {
    const request = {
      alias: "@1",
      password: "test1",
    };
    [user, authToken] = await serverFacade.login(request);
  });

  beforeEach(() => {
    mockPostStatusPresenterView = mock<PostStatusView>();

    const presenter = new PostStatusPresenter(
      instance(mockPostStatusPresenterView),
      user,
      authToken,
    );

    postStatusPresenter = presenter;
  });

  it("should post a status and find it in the user's story", async () => {
    const postText = `Integration Test Post: ${Date.now()}`;
    const mockEvent = instance(mock<React.MouseEvent>());

    await postStatusPresenter.submitPost(mockEvent, postText);

    await new Promise((f) => setTimeout(f, 2000));

    verify(
      mockPostStatusPresenterView.displayInfoMessage("Status posted!", 2000),
    ).once();

    const [stories] = await statusService.loadMoreStoryItems(
      authToken,
      user.alias,
      10,
      null,
    );

    const found = stories.find((s) => s.post === postText);

    expect(found).toBeDefined();
    expect(found?.user.alias).toEqual(user.alias);
    expect(found?.post).toEqual(postText);
  });
});
