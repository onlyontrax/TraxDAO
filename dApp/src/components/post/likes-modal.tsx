import { reactionService } from "@services/index";
import UserListModal from "../shared/user-list-modal";

interface IProps {
  postId: string;
}

class LikesModal extends UserListModal<IProps> {
  title: string = "Likes";

  async componentDidMount() {
    try {
      this.setState({
        users: (await reactionService.postReactions(this.props.postId)).data || [],
      });
    } catch (e) {
      console.error(e);
    }
  }
}

export default LikesModal;
