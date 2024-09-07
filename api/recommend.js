// api/recommend.js (Vercel에서 자동으로 서버 측으로 처리됨)
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { mood, weather, menuData } = req.body;

    const apiKey = process.env.OPENAI_API_KEY; // 서버 측에서 환경변수로 불러옴

    try {
      const menuString = menuData.map(menu => `${menu.name} (${menu.category}): ${menu.description}`).join('\n');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { "role": "system", "content": "You are a helpful assistant that recommends menus based on mood and weather." },
            { "role": "user", "content": `기분은 ${mood}이고, 현재 기온은 ${weather.temperature}도이며, 강수량은 ${weather.precipitation}mm, 구름양은 ${weather.cloudCover}%입니다. 다음 상점의 메뉴 중 적절한 메뉴를 추천해 주세요:\n${menuString}` }
          ]
        })
      });

      const data = await response.json();
      res.status(200).json({ recommendation: data.choices[0].message.content });

    } catch (error) {
      res.status(500).json({ message: 'API 요청 중 오류가 발생했습니다.' });
    }
  } else {
    res.status(405).json({ message: 'POST 요청만 가능합니다.' });
  }
}
