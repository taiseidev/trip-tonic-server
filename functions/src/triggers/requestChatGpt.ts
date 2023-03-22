/* eslint-disable */
import * as dotenv from 'dotenv'
dotenv.config()
import axios from "axios";
import { functions, admin } from '../firebase';

const db = admin.firestore();

// TODO: エラーハンドリングを追加する
export const trigger = async (req: functions.https.Request, res: functions.Response<any>) => {
    const apiKey = process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY;
    const location = req.query.location;

    const collectionRef = db.collection("words");

    const querySnapshot = await collectionRef.get();
    const words: any[] = [];


    querySnapshot.forEach((doc) => {
        words.push({
            id: doc.id,
            word: doc.data().word,
        });
    });

    const collectionLength = await collectionRef.count().get();

    // 引数の整数化と範囲の確認
    const minInt = Math.ceil(1);
    const maxInt = Math.floor(collectionLength.data().count);

    // Math.random() は 0 以上 1 未満のランダムな数を生成するため、適切な範囲にスケーリングして四捨五入
    const randomNum = Math.floor(Math.random() * (maxInt - minInt + 1)) + minInt;


    functions.logger.info(`🚀${words[randomNum].word}🚀`);

    const apiClient = axios.create({
        baseURL: "https://api.openai.com/v1/chat",
        responseType: "json",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
        },
    });

    // ここで適切な回答を取得するためのプロンプトを生成する。
    const response = await apiClient.post('/completions', {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "assistant",
                "content": `# ゴール\nあなたは芥川賞や直木賞といった文学賞を受賞するほどの実力を持つ小説家です。\n与えられた情報を元に人を惹きつけるような短編小説を書いてください。なお、小説の舞台は${location}で、小説は起承転結の形式で作成してください。\n\n[キーワード]${words[randomNum].word}\n[ジャンル]：純文学、大衆文学 、ミステリー小説、ハードボイルド小説 、恋愛小説 、青春小説 、官能小説 、BL小説 、SF小説 、ファンタジー小説 、ホラー小説 、ライトノベル、なろう系小説 、異世界転生小説 、時代・歴史小説 、ノンフィクション小説 、コメディ小説 \n[C1] = [ジャンル]の中から一つを選択し、[キーワード]に沿った小説のタイトルを考えてください。\n[C2] = [C1]のタイトルから想像を膨らませ、で短編小説の本文を完成させてください。なお、文章は必ず完結させてください。文章量は1000前後でお願いします。\n\n> Run commands [C1] [C2]\n`,
            }
        ]
    });
    functions.logger.info(`🚀${response.data}🚀`);

    res.status(200).send(response.data);
};

