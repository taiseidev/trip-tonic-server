/* eslint-disable */
import axios from "axios";
import { admin } from '../firebase';
const db = admin.firestore();

interface Coordinates {
    latitude: number;
    longitude: number;
}

interface Maker {
    latitude: number;
    longitude: number;
    genre: string;
    country: string;
    createdAt: admin.firestore.Timestamp;
}

interface LocationData {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    lat: string;
    lon: string;
    display_name: string;
    address: {
        neighbourhood: string;
        suburb: string;
        city: string;
        province: string;
        ISO3166_2_lvl4: string;
        postcode: string;
        country?: string;
        country_code: string;
    };
    boundingbox: [string, string, string, string];
}

const collectionRef = db.collection("markers");

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

        const data = response.data as LocationData;

        const genre = _getRandomGenre();
        console.log('ジャンル:', genre);

        if (data.address == null || data.address.country == null || data.lat == null || data.lon == null) {
            return;
        }

        // 保存するデータを作成
        const dataToSave: Maker = {
            latitude: Number(data.lat),
            longitude: Number(data.lon),
            genre: genre,
            country: data.address.country,
            createdAt: admin.firestore.Timestamp.now(),
        };

        // Firestoreにデータを保存
        await _saveToFirestore(dataToSave);

        const collectionLength = await collectionRef.count().get();

        if (collectionLength.data().count > 100) {
            const querySnapshot = await collectionRef
                .orderBy("createdAt", "asc")
                .limit(1)
                .get();

            if (!querySnapshot.empty) {
                const oldestDoc = querySnapshot.docs[0];
                await collectionRef.doc(oldestDoc.id).delete();
                console.log(`Deleted the oldest document with ID: ${oldestDoc.id}`);
            }
        }

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

async function _saveToFirestore(data: Maker): Promise<void> {
    const doc = collectionRef.doc();

    try {
        await doc.set({ ...data, id: doc.id });
    } catch (error) {
        console.error("Error adding document: ", error);
    }
}

const genres = ['純文学', '大衆文学', 'ミステリー小説', 'ハードボイルド小説', '恋愛小説', '青春小説', '官能小説', 'BL小説', 'SF小説', 'ファンタジー小説', 'ホラー小説', 'ライトノベル', 'なろう系小説', '異世界転生小説', '時代・歴史小説', 'ノンフィクション小説', 'コメディ小説',];
// TODO: Firestoreからジャンルを取得するよう変更する
function _getRandomGenre(): string {
    return genres[Math.floor(Math.random() * (Math.floor(genres.length) - Math.ceil(1) + 1))];
}
