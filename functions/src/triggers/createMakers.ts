/* eslint-disable */
import axios from "axios";
import { admin } from '../firebase';
const db = admin.firestore();

interface Coordinates {
    latitude: number;
    longitude: number;
}

export const trigger = async () => {
    const latLng = _getRandomLatLng();

    console.log('ランダムな緯度:', latLng.latitude);
    console.log('ランダムな経度:', latLng.longitude);

    const url = 'https://nominatim.openstreetmap.org/reverse';

    // サーバーに負荷をかけないように2秒間待つ
    await _sleep(2000);

    try {
        const response = await axios.get(url, {
            params: {
                format: 'json',
                lat: latLng.latitude,
                lon: latLng.longitude
            }
        });

        const genre = _getRandomGenre();
        console.log('ジャンル:', genre);
        // 保存するデータを作成
        const dataToSave = {
            latitude: response.data.lat,
            longitude: response.data.lon,
            genre: genre,
            display_name: response.data.display_name,
            country: response.data.address.country,
            createdAt: admin.firestore.Timestamp.now(),
        };

        // Firestoreにデータを保存
        await _saveToFirestore(dataToSave);

    } catch (error) {
        console.error('エラーが発生しました:', error);
    }
};


function _getRandomLatLng(): Coordinates {
    const minLatitude = -90;
    const maxLatitude = 90;
    const minLongitude = -180;
    const maxLongitude = 180;

    const latitude = Math.random() * (maxLatitude - minLatitude) + minLatitude;
    const longitude = Math.random() * (maxLongitude - minLongitude) + minLongitude;
    return { latitude, longitude }
}

function _sleep(ms: number): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function _saveToFirestore(data: any): Promise<void> {
    try {
        const docRef = await db.collection("makers").add(data);
        console.log("Document successfully written with ID: ", docRef.id);
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

// TODO: Firestoreからジャンルを取得するよう変更する
function _getRandomGenre(): string {
    const genres = ['純文学', '大衆文学', 'ミステリー小説', 'ハードボイルド小説', '恋愛小説', '青春小説', '官能小説', 'BL小説', 'SF小説', 'ファンタジー小説', 'ホラー小説', 'ライトノベル', 'なろう系小説', '異世界転生小説', '時代・歴史小説', 'ノンフィクション小説', 'コメディ小説',];

    const minInt = Math.ceil(1);
    const maxInt = Math.floor(genres.length);
    const randomNum = Math.floor(Math.random() * (maxInt - minInt + 1));

    return genres[randomNum];

}
