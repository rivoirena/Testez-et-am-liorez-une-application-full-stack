import { Session } from '../../src/app/core/models/session.interface';
import { User } from '../../src/app/core/models/user.interface';

declare global {
  namespace Cypress {
    interface Chainable {
      login(user: User, sessions: import('../../src/app/core/models/session.interface').Session[]): Chainable<User>;
    }
  }
}