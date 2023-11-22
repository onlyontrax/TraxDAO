import Image from 'next/image';
import { IUser } from 'src/interfaces';

interface Props<T> {
  members: T[];
}

function StreamingChatUsers({
  members = []
}: Props<IUser>) {
  return (
    <div className="conversation-users">
      <div className="users">
        {members.length > 0
          && members.map((member) => (
            <div className="user" key={member._id}>
              <Image alt="avt" src={member?.avatar || '/static/no-avatar.png'} />
              <span className="username">{member?.name || member?.username || 'N/A'}</span>
            </div>
          ))}
      </div>
    </div>
  );
}

export default StreamingChatUsers;
