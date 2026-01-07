import { ExtendedItineraryItem, ItineraryType } from "@/types/notion";

export const MOCK_IMAGES = {
  cafe: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
  park: "https://images.unsplash.com/photo-1598970434795-0c54fe7c0648?w=800&q=80",
  shop: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  train: "https://images.unsplash.com/photo-1534053915-c2d1316b231d?w=800&q=80",
  food: "https://images.unsplash.com/photo-1596426724391-766323c21a4f?w=800&q=80",
  night: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&q=80",
  market: "https://images.unsplash.com/photo-1533050487297-09b450131914?w=800&q=80",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  default: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80"
};

export const getImageForType = (type: ItineraryType) => {
    switch (type) {
      case 'food': return MOCK_IMAGES.food;
      case 'transport': return MOCK_IMAGES.train;
      case 'shop': return MOCK_IMAGES.shop;
      case 'activity': return MOCK_IMAGES.park;
      case 'stay': return MOCK_IMAGES.hotel;
      default: return MOCK_IMAGES.default;
    }
  };

export const INITIAL_DATA: ExtendedItineraryItem[] = [
  {
    id: "1",
    time: "09:00",
    title: "Fuglen 東京",
    area: "澀谷",
    type: "food",
    status: "Scheduled",
    categories: ["咖啡廳", "早午餐"],
    mapsUrl: "https://goo.gl/maps/example",
    date: "2023-10-30",
    coverImage: MOCK_IMAGES.cafe,
    summary: "以淺焙咖啡和復古家具聞名。必點挪威鬆餅，早上去氣氛最好。",
    lastEdited: new Date().toISOString(),
    cost: 1500,
    currency: 'JPY'
  },
  {
    id: "2",
    title: "Parco 屋頂花園",
    time: "10:30",
    area: "澀谷",
    type: "activity",
    status: "Scheduled",
    categories: ["公園", "景觀"],
    mapsUrl: "https://goo.gl/maps/example",
    date: "2023-10-30",
    coverImage: MOCK_IMAGES.park,
    summary: "免費的屋頂花園，可俯瞰澀谷十字路口與周邊美景。適合購物後休息片刻。",
    lastEdited: new Date().toISOString(),
    cost: 0,
    currency: 'JPY'
  },
  {
    id: "Inbox1",
    time: "TBD",
    title: "teamLab Planets",
    area: "豐洲",
    type: "activity",
    status: "Inbox",
    categories: ["展覽"],
    mapsUrl: "",
    date: "",
    coverImage: MOCK_IMAGES.night,
    summary: "想去但還沒決定哪天，記得要先買票。",
    lastEdited: new Date().toISOString(),
    cost: 3200,
    currency: 'JPY'
  },
  {
    id: "4",
    title: "前往新宿",
    time: "12:00",
    area: "交通",
    type: "transport",
    status: "Scheduled",
    categories: ["電車"],
    mapsUrl: "",
    date: "2023-10-31",
    coverImage: MOCK_IMAGES.train,
    summary: "搭乘山手線外回線，注意避開車頭車尾人潮。",
    lastEdited: new Date().toISOString(),
    transport: {
      mode: "JR 山手線",
      from: "澀谷",
      to: "新宿",
      platform: "2",
      car: "4",
      seat: "自由座",
      duration: "7分"
    },
    cost: 170,
    currency: 'JPY'
  },
  {
    id: "5",
    title: "思出橫丁",
    time: "12:30",
    area: "新宿",
    type: "food",
    status: "Scheduled",
    categories: ["美食", "串燒"],
    mapsUrl: "",
    date: "2023-10-31",
    coverImage: MOCK_IMAGES.food,
    summary: "充滿昭和風情的小巷。大部分店家中午就開始營業，推薦嘗試鰻魚串。",
    lastEdited: new Date().toISOString(),
    cost: 3000,
    currency: 'JPY'
  },
  {
    id: "Inbox2",
    time: "TBD",
    title: "銀座 LoFt",
    area: "銀座",
    type: "shop",
    status: "Inbox",
    categories: ["購物"],
    mapsUrl: "",
    date: "",
    coverImage: MOCK_IMAGES.shop,
    summary: "有空的話可以去逛逛文具。",
    lastEdited: new Date().toISOString()
  },
  {
    id: "7",
    title: "築地場外市場",
    time: "08:00",
    area: "築地",
    type: "food",
    status: "Scheduled",
    categories: ["市場", "早餐"],
    mapsUrl: "",
    date: "2023-11-02",
    coverImage: MOCK_IMAGES.market,
    summary: "先去排玉子燒。早上 9 點後人潮會非常多，建議提早抵達。",
    lastEdited: new Date().toISOString(),
    cost: 2000,
    currency: 'JPY'
  },
  {
    id: "8",
    title: "APA Hotel 新宿歌舞伎町",
    time: "15:00",
    area: "新宿",
    type: "stay",
    status: "Scheduled",
    categories: ["住宿", "飯店"],
    mapsUrl: "https://goo.gl/maps/exampleHotel",
    date: "2023-10-31",
    coverImage: MOCK_IMAGES.hotel,
    summary: "位於歌舞伎町中心，交通便利。頂樓設有大浴場。",
    lastEdited: new Date().toISOString(),
    accommodation: {
        isBreakfastIncluded: true,
        isDinnerIncluded: false,
        checkIn: "15:00",
        checkOut: "11:00",
        facilities: ["大浴場", "Wifi", "行李寄放"]
    },
    cost: 12000,
    currency: 'JPY'
  }
];

export const DATES = [
  { label: "30", full: "2023-10-30", day: "週一", month: "10月" },
  { label: "31", full: "2023-10-31", day: "週二", month: "10月" },
  { label: "01", full: "2023-11-01", day: "週三", month: "11月" },
  { label: "02", full: "2023-11-02", day: "週四", month: "11月" },
  { label: "03", full: "2023-11-03", day: "週五", month: "11月" },
];

export const TIME_OPTIONS_30_MIN = (() => {
  const options = [];
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    options.push(`${hour}:00`);
    options.push(`${hour}:30`);
  }
  return options;
})();
