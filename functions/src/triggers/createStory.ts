/* eslint-disable */
import * as dotenv from 'dotenv'
import axios, { AxiosResponse } from "axios";
import { functions } from '../firebase';

dotenv.config()

const apiKey = process.env.NEXT_PUBLIC_CHAT_GPT_API_KEY;
const responseType = "json";
const apiUrl = "https://api.openai.com/v1/chat";
const endPoint = "/completions";
const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
};

// 過去の会話履歴を保存する配列
let conversationHistory: IMessage[] = [];

interface IMessage {
    role: string;
    content: string;
}

const apiClient = axios.create({
    baseURL: apiUrl,
    responseType: responseType,
    headers: headers,
});

// メッセージを追加するメソッド
function addMessage(role: string, content: string): void {
    conversationHistory.push({ role, content });
}

// ChatGPTのAPIを叩くメソッド
async function callChatGPT(): Promise<string> {
    try {
        const response: AxiosResponse = await apiClient.post(endPoint, {
            "model": "gpt-3.5-turbo",
            "messages": conversationHistory,
        });
        console.info('🚀レスポンス内容🚀');
        console.info(response.data);

        const generatedText = response.data.choices[0].message.content.trim();
        return generatedText;
    } catch (error) {
        console.error('💣エラーが発生しました💣');
        console.error("Error calling ChatGPT API:", error);
        throw error;
    }
}

// メインの会話関数
async function chat(inputText: string): Promise<void> {
    addMessage("user", inputText);
    const assistantResponse = await callChatGPT();
    addMessage("assistant", assistantResponse);
}

// 文章を整形するメソッド
function formatContent(): string {
    let content: string = "";
    for (var i = 0; i < conversationHistory.length; i++) {
        if (isOdd(i)) {
            // 結合しなければならないので修正。
            content = content + conversationHistory[i].content + "\n\n";
        }
    }
    return content;
}

// 奇数かどうか
function isOdd(number: number): boolean {
    return number % 2 !== 0;
}

function generateInitPrompt(genre: string, keyWord: string, character: string[]): string {
    const initPrompt = `
    # ゴール
    あなたは芥川賞や直木賞といった文学賞を受賞するほどの実力を持つ小説家です。
    与えられた次の変数一覧を元に具体的で没入できるような小説を作成してください。
    
    # 変数一覧
    [ジャンル]：ホラー
    [設定]：現代と16世紀の日本
    [登場人物]：サム（35歳の歴史家）、ユミ（16世紀の侍の娘）
    [コンフリクト]：サムがタイムマシンで16世紀の日本に迷い込む。彼は現代に戻る方法を探し求めるが、彼の知識が悪用されることを恐れるユミによって妨害される。
    [目標]：サムはユミと協力して現代に戻る方法を見つけ、その過程で彼らは互いの世界を理解し合う。
    
    [C1]：変数一覧から連想される[ジャンル]小説のタイトルを考えてください。
    [C2]：変数一覧の情報を元に、具体的で想像がつきやすいような「ジャンル」小説を作成してください。
    
    # 条件
    ・小説の出力は3部に分けて出力し、具体的な内容の小説を作成します。今回の出力では1部を作成してください。
    ・小説の内容は与えられら変数一覧から連想して具体的な内容になるよう考えてください。存在しない地名や人名を使用することも許可します。
    ・文章に感情を持たせてください。
    ・登場人物の話し言葉、また会話等を含めてください。
    ・[登場人物]が直面する具体的な困難や敵を明確に描写し、物語の緊張感やサスペンスを高めてください。

    # 出力形式

    タイトル
    1部の内容

    `;

    return initPrompt;
}

// 一秒間待つ
async function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const trigger = async (req: functions.https.Request, res: functions.Response<any>) => {
    const genre: any = req.query.genre || '';
    const keyWord: any = req.query.keyWord || '';
    // 文字列からリストに変換
    const characterString: any = req.query.character || '[]';
    const characters: string[] = JSON.parse(characterString);

    console.info(`ジャンル：${genre}`);
    console.info(`キーワード${keyWord}`);
    console.info(`キャラクター一覧：${characters}`);

    // TODO: 精度が良くないのでプロンプトを修正する
    await chat(generateInitPrompt(genre, keyWord, characters));
    await delay(3000);
    await chat("1部の続きである2部を作成してください。また、1部の内容を深掘り、物語に具体性を持たせてください。[C2]の続き： という文言は省いてください。\n\n# 出力形式\n2部の内容");
    await delay(3000);
    await chat("2部の続きである3部を作成してください。また、2部の内容を深掘り、物語に具体性を持たせてください。[C2]と[C3]の続き： という文言は省いてください。なお、物語を必ず完結させてください。\n\n# 出力形式\n3部の内容");
    const content = formatContent();
    console.info(`📝出力内容📝\n${content}`);
    res.status(200).send(content);
};
