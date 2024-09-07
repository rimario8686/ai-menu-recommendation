// 남양주의 날씨 데이터를 가져오는 함수
async function getWeather() {
  console.log("날씨 데이터를 요청 중...");
  
  // 현재 시간을 기준으로 인덱스를 계산
  const now = new Date();
  const currentHour = now.getUTCHours(); // UTC 기준의 현재 시간 (한국 시간은 +9시간)
  
  // Open-Meteo API로 날씨 데이터 요청 (남양주 위도와 경도)
  const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.634&longitude=127.216&hourly=temperature_2m,precipitation,cloudcover&timezone=Asia/Seoul');
  const data = await response.json();
  console.log("받아온 날씨 데이터: ", data); // 받아온 날씨 데이터 확인

  // 현재 시간에 해당하는 데이터를 추출
  const temperature = data.hourly.temperature_2m[currentHour]; // 현재 시간대의 기온
  const precipitation = data.hourly.precipitation[currentHour]; // 현재 시간대의 강수량
  const cloudCover = data.hourly.cloudcover[currentHour]; // 현재 시간대의 구름 양
  
  return { temperature, precipitation, cloudCover }; // 필요한 날씨 데이터를 반환
}

// 메뉴 데이터를 JSON 파일에서 불러오는 함수
async function getMenuData() {
  const response = await fetch('menuData.json');
  const data = await response.json();
  return data.menus; // 메뉴 데이터 반환
}

// GPT-3.5 API를 호출하여 메뉴를 추천받는 함수
async function getMenuRecommendation(mood, weather, menuData) {
  console.log("GPT-3.5로 메뉴 추천 요청 중...");

  const menuString = menuData.map(menu => `${menu.name} (${menu.category}): ${menu.description}`).join('\n');

  // Vercel 클라이언트 환경 변수를 통해 OpenAI API 키 가져오기
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY; // NEXT_PUBLIC 접두사로 브라우저에서 접근 가능

  if (!apiKey) {
    console.error("API 키가 정의되지 않았습니다.");
    throw new Error("API 키가 정의되지 않았습니다.");
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}` // 환경 변수에서 가져온 API 키 사용
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

// 사용자가 버튼을 클릭할 때 실행되는 함수
async function recommendMenu() {
  const mood = document.getElementById('mood').value; // 사용자가 입력한 기분
  console.log("입력한 기분: ", mood);

  const weather = await getWeather(); // 현재 날씨 데이터를 가져옴
  console.log("현재 날씨: ", weather); // 받아온 날씨 데이터를 콘솔에 출력
  
  const menuData = await getMenuData(); // 메뉴 데이터를 불러옴
  console.log("상점 메뉴 데이터: ", menuData); // 메뉴 데이터 출력

  // GPT-3.5를 사용하여 메뉴 추천 받기
  try {
    const recommendation = await getMenuRecommendation(mood, weather, menuData);
    console.log("추천된 메뉴: ", recommendation); // 추천된 메뉴를 콘솔에 출력

    // 추천된 메뉴를 HTML로 출력 (볼드 태그 적용)
    document.getElementById('recommendation').innerHTML = recommendation;
  } catch (error) {
    console.error("오류 발생: ", error);
    document.getElementById('recommendation').innerText = "메뉴를 추천하는 중 오류가 발생했습니다. 다시 시도해주세요.";
  }
}
