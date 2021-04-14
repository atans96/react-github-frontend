import React from 'react';
class Profile extends React.Component<any> {
  render() {
    const { binder, avatar, ...rest } = this.props.componentProps;
    return (
      <li {...binder} {...rest}>
        <img alt="avatar" className="avatar-img" src={avatar} />
        <small
          style={{
            textAlign: 'center',
            color: this.props.componentProps.active === 'profile' ? 'white' : 'black',
          }}
        >
          <strong>Profile</strong>
        </small>
      </li>
    );
  }
}
export default Profile;
