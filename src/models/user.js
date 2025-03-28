import { Model, DataTypes } from 'sequelize';
import sequelize from './database';

class User extends Model {
  static associate(models) { }

  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

User.init({
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  sequelize,
  modelName: 'User',
});

export default User;
