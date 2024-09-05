// GPT-3.5 API를 호출하여 메뉴를 추천받는 함수
async function getMenuRecommendation(mood, weather, menuData) {
  console.log("GPT-3.5로 메뉴 추천 요청 중...");
  
  // 환경 변수 출력
  console.log("API 키 확인: ", process.env.NEXT_PUBLIC_KIROS_KEY_PROJ); // 환경 변수 확인을 위한 로그 출력
  
  const menuString = menuData.map(menu => `${menu.name} (${menu.category}): ${menu.description}`).join('\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_KIROS_KEY_PROJ}` // 발급받은 OpenAI API 키
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
  console.log("GPT-3.5의 응답: ", data);

  if (data.choices && data.choices.length > 0) {
    let recommendation = data.choices[0].message.content;

    // 추천된 메뉴 이름들을 볼드 처리
    menuData.forEach(menu => {
      const regex = new RegExp(menu.name, 'g'); // 메뉴 이름을 찾는 정규식
      recommendation = recommendation.replace(regex, `<strong>${menu.name}</strong>`); // 메뉴 이름을 볼드 처리
    });

    return recommendation; // 볼드 처리된 추천 내용을 반환
  } else {
    throw new Error("응답에서 메뉴 추천을 가져올 수 없습니다.");
  }
}
