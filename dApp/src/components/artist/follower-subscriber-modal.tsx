import UserListModal from "../shared/user-list-modal";
import { followService, subscriptionService } from "@services/index";

interface IProps {
  which: "follower" | "subscriber";
  userId: string;
}

class FollowerSubscriberModal extends UserListModal<IProps> {
  title: string = this.props.which === "follower" ? "Followers" : "Subscribers";

  async componentDidMount() {
    try {
      if (this.props.which === "follower")
        return this.setState({
          users: (await followService.getFollowersByPerformerId(this.props.userId)).data || [],
        });
      this.setState({
        users: (await subscriptionService.getSubscribersByPerformerId(this.props.userId)).data || [],
      });
    } catch (e) {
      console.error(e);
    }
  }
}

export default FollowerSubscriberModal;
