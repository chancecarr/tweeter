import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import Login from "./components/authentication/login/Login";
import Register from "./components/authentication/register/Register";
import MainLayout from "./components/mainLayout/MainLayout";
import Toaster from "./components/toaster/Toaster";
import { useUserInfo } from "./components/userInfo/UserInfoActions";
import { FolloweePresenter } from "./presenter/FolloweePresenter";
import { FollowerPresenter } from "./presenter/FollowerPresenter";
import { FeedPresenter } from "./presenter/FeedPresenter";
import { StoryPresenter } from "./presenter/StoryPresenter";
import { Status, User } from "tweeter-shared";
import { PagedItemView } from "./presenter/PagedItemPresenter";
import ItemScroller from "./components/mainLayout/ItemScroller";
import { UserItemPresenter } from "./presenter/UserItemPresenter";
import UserItem from "./components/userItem/UserItem";
import { StatusItemPresenter } from "./presenter/StatusItemPresenter";
import StatusItem from "./components/statusItem/StatusItem";

const App = () => {
  const { currentUser, authToken } = useUserInfo();

  const isAuthenticated = (): boolean => {
    return !!currentUser && !!authToken;
  };

  return (
    <div>
      <Toaster position="top-right" />
      <BrowserRouter>
        {isAuthenticated() ? (
          <AuthenticatedRoutes />
        ) : (
          <UnauthenticatedRoutes />
        )}
      </BrowserRouter>
    </div>
  );
};

const renderStatusItem = (status: Status, featureUrl: string) => (
  <StatusItem status={status} featurePath={featureUrl} />
);

const renderUserItem = (user: User, featureUrl: string) => (
  <UserItem user={user} featurePath={featureUrl} />
);

const createFeedPresenter = (view: PagedItemView<Status>) =>
  new FeedPresenter(view);

const createStoryPresenter = (view: PagedItemView<Status>) =>
  new StoryPresenter(view);

const createFolloweePresenter = (view: PagedItemView<User>) =>
  new FolloweePresenter(view);

const createFollowerPresenter = (view: PagedItemView<User>) =>
  new FollowerPresenter(view);

const AuthenticatedRoutes = () => {
  const { displayedUser } = useUserInfo();

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          index
          element={<Navigate to={`/feed/${displayedUser!.alias}`} />}
        />
        <Route
          path="feed/:displayedUser"
          element={
            <ItemScroller<Status, StatusItemPresenter>
              key={`feed-${displayedUser!.alias}`}
              featureUrl="/feed"
              presenterFactory={createFeedPresenter}
              itemComponentFactory={renderStatusItem}
            />
          }
        />
        <Route
          path="story/:displayedUser"
          element={
            <ItemScroller<Status, StatusItemPresenter>
              key={`story-${displayedUser!.alias}`}
              featureUrl="/story"
              presenterFactory={createStoryPresenter}
              itemComponentFactory={renderStatusItem}
            />
          }
        />
        <Route
          path="followees/:displayedUser"
          element={
            <ItemScroller<User, UserItemPresenter>
              key={`followees-${displayedUser!.alias}`}
              featureUrl="/followees"
              presenterFactory={createFolloweePresenter}
              itemComponentFactory={renderUserItem}
            />
          }
        />
        <Route
          path="followers/:displayedUser"
          element={
            <ItemScroller<User, UserItemPresenter>
              key={`followers-${displayedUser!.alias}`}
              featureUrl="/followers"
              presenterFactory={createFollowerPresenter}
              itemComponentFactory={renderUserItem}
            />
          }
        />
        <Route path="logout" element={<Navigate to="/login" />} />
        <Route
          path="*"
          element={<Navigate to={`/feed/${displayedUser!.alias}`} />}
        />
      </Route>
    </Routes>
  );
};

const UnauthenticatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Login originalUrl={location.pathname} />} />
    </Routes>
  );
};

export default App;
