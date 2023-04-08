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

        const generatedText = response.data.choices[0].message.content.trim();
        return generatedText;
    } catch (error) {
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
    与えられた情報を元に、誰もが没入できるような小説を作成していください。
    
    # 変数
    [登場人物]：${character}
    [キーワード]：${keyWord}
    [ジャンル]：${genre}
    [舞台]：「ジャンル」から連想される場所（ex: 和風ホラー => 日本の不気味な古民家、ファンタジー => アイルランドの街並み）
    [起承転結]：起承転結は、物語や論説の流れを読み手にわかりやすく伝えるために重要な役割を果たします。起：物語や論説の最初の部分で、背景や登場人物の紹介、問題提起などが行われます。承：物語や論説の展開部分で、問題が発生し、登場人物がそれに取り組む様子が描かれます。転：物語や論説の展開部分で、物語や論説が一変し、新たな展開が生まれます。結：物語や論説の最後の部分で、問題が解決され、結末が描かれます。
    
    [C1]：[キーワード]と[ジャンル]から連想される小説のタイトルを考えてください。
    [C2]：[登場人物]、[キーワード]、[ジャンル]、[舞台]の情報を元に、具体的で想像がつきやすいような小説を作成してください。
    
    # 条件
    小説の出力の形式は4回に分けて行い、[起承転結]がある作品を作成します。今回の出力では[起承転結]の[起]と[承]の部分の小説を1000字程度で作成してください。
    
    > Run commands [C1] [C2]
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

    // TODO: 精度が良くないのでプロンプトを修正する
    await delay(1000);
    await chat(generateInitPrompt(genre, keyWord, characters));
    // await chat("[起]と[承]の続きである[転][結]とを1000字程度で作成してください。");
    const content = formatContent();
    res.status(200).send(content);
};
