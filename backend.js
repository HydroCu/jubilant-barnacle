const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// 1. 配置密钥
const userKeys = {
  user1: 'KEY1',
  user2: 'KEY2',
  user3: 'KEY3',
  user4: 'KEY4',
  user5: 'KEY5',
};
const adminKey = 'ADMINKEY';

// 2. 储存抽签结果（内存版）
let draws = {}; // { user: number }
let numbers = [1,2,3,4,5];

// 3. Express设置
const app = express();
app.use(bodyParser.json());
app.use(cors());

// 4. 用户身份验证
function getUserByKey(key) {
  for (const u in userKeys) if (userKeys[u] === key) return u;
  return null;
}

// 5. 抽签接口
app.post('/draw', (req, res) => {
  const { key } = req.body;
  const user = getUserByKey(key);
  if (!user) return res.status(401).json({ error: '无效密钥' });
  if (draws[user]) return res.json({ number: draws[user], info: '您已经抽过了' });

  // 从剩下的数字中随机抽取
  const left = numbers.filter(n => !Object.values(draws).includes(n));
  if (left.length === 0) return res.status(400).json({ error: '号码已抽完' });
  const number = left[Math.floor(Math.random()*left.length)];
  draws[user] = number;
  res.json({ number });
});

// 6. 管理员查看结果
app.post('/result', (req, res) => {
  const { key } = req.body;
  if (key !== adminKey) return res.status(401).json({ error: '无权访问' });
  res.json({ draws });
});

// 7. 启动服务
app.listen(3000, () => {
  console.log('Lottery backend running at http://localhost:3000');
});