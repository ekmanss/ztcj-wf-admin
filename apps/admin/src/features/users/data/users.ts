import { faker } from '@faker-js/faker'
import { type User } from './schema'

// Set a fixed seed for consistent data generation
faker.seed(67890)

export const users: User[] = Array.from({ length: 500 }, (_, index) => {
  const username = faker.internet.username().toLocaleLowerCase()
  const nickname = faker.person.fullName()

  return {
    id: index + 1,
    groupId: 1,
    groupName: '默认组',
    username,
    nickname,
    email: faker.internet.email().toLocaleLowerCase(),
    mobile: faker.string.numeric(11),
    avatar: '',
    level: faker.number.int({ min: 0, max: 9 }),
    gender: faker.helpers.arrayElement([0, 1]),
    birthday: faker.date.birthdate().toISOString().slice(0, 10),
    bio: '',
    money: faker.finance.amount({ min: 0, max: 1000, dec: 2 }),
    score: faker.number.int({ min: 0, max: 10000 }),
    successions: faker.number.int({ min: 1, max: 30 }),
    maxSuccessions: faker.number.int({ min: 1, max: 60 }),
    prevTime: Math.floor(faker.date.past().getTime() / 1000),
    loginTime: Math.floor(faker.date.recent().getTime() / 1000),
    loginIp: faker.internet.ipv4(),
    loginFailure: 0,
    loginFailureTime: null,
    joinIp: faker.internet.ipv4(),
    joinTime: Math.floor(faker.date.past().getTime() / 1000),
    createTime: Math.floor(faker.date.past().getTime() / 1000),
    updateTime: Math.floor(faker.date.recent().getTime() / 1000),
    status: faker.helpers.arrayElement(['normal', 'hidden']),
  }
})
