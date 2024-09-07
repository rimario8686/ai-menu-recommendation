export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { mood, weather, menuData } = req.body;
    const apiKey = process.env.OPENAI_API_KEY; // 환경변수를 통해 API 키 가져옴

    try {
      const menuString = menuData.map(menu => `${menu.name} (${menu.category}): ${menu.description}`).join('\n');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}` // API 키를 Authorization 헤더에 전달
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
      console.log("GPT-3.5의 응답: ", data); // 응답 데이터 로그 출력

      if (response.ok && data.choices && data.choices.length > 0) {
        let recommendation = data.choices[0].message.content;

        // 추천된 메뉴 이름들을 볼드 처리
        menuData.forEach(menu => {
          const regex = new RegExp(menu.name, 'g');
          recommendation = recommendation.replace(regex, `<strong>${menu.name}</strong>`);
        });

        res.status(200).json({ recommendation }); // 정상적으로 메뉴 추천 반환
      } else {
        console.error("OpenAI 응답 에러:", data); // 오류 응답 로그 출력
        res.status(500).json({ message: "메뉴 추천을 가져올 수 없습니다." });
      }
    } catch (error) {
      console.error("API 요청 중 오류 발생:", error); // API 요청 에러 로그 출력
      res.status(500).json({ message: "API 요청 중 오류가 발생했습니다." });
    }
  } else {
    res.status(405).json({ message: 'POST 요청만 가능합니다.' });
  }
}
