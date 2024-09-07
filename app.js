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

// 서버로부터 메뉴 추천을 받는 함수
async function getMenuRecommendation(mood, weather, menuData) {
  try {
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mood, weather, menuData }) // 기분, 날씨, 메뉴 데이터를 서버로 전송
    });

    const data = await response.json();
    return data.recommendation;
  } catch (error) {
    console.error('메뉴 추천 요청 중 오류 발생:', error);
    throw new Error('메뉴 추천 실패');
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

  // 서버(API)를 사용하여 메뉴 추천 받기
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
