/* eslint-disable */
import { UserRecord } from 'firebase-admin/auth';
import * as functions from 'firebase-functions';
import admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

export { UserRecord, functions, admin, RequestHandler };
export type Snapshot = functions.firestore.QueryDocumentSnapshot;
export type Change = functions.Change<functions.firestore.QueryDocumentSnapshot>;
export type Context = functions.EventContext;
export type Request = functions.https.Request;
export type Response = functions.Response;

type SnapshotHandler = { trigger: (snapshot: Snapshot, context: Context) => Promise<unknown> };
type ChangeHandler = { trigger: (change: Change, context: Context) => Promise<unknown> };
type UserHandler = { trigger: (change: UserRecord, context: Context) => Promise<unknown> };
type RequestHandler = { trigger: (req: functions.https.Request, resp: functions.Response<any>) => Promise<void> };

const getHandler = async (handlerFileName: string) => {
    const handlerFilePath = `./triggers/${handlerFileName}`;
    return await import(handlerFilePath);
};

const db = functions.region('asia-northeast1').firestore;
const auth = functions.region('asia-northeast1').auth.user();
const https = functions.region('asia-northeast1').https;

// ユーザ登録時
export const onRegist = (handlerFileName: string) =>
    auth.onCreate(async (user, context) => {
        const handler: UserHandler = await getHandler(handlerFileName);
        return handler.trigger(user, context);
    });

/**
 * @param documentPath - トリガー起点の Firestore ドキュメントのパス
 * @param handlerFileName - "./triggers"直下のファイル名（拡張子除く）
 */
export const onCreate = (documentPath: string, handlerFileName: string) => {
    return db.document(documentPath).onCreate(async (snapshot, context) => {
        const handler: SnapshotHandler = await getHandler(handlerFileName);
        return handler.trigger(snapshot, context);
    });
};

/**
 * @param documentPath - トリガー起点の Firestore ドキュメントのパス
 * @param handlerFileName - "./triggers"直下のファイル名（拡張子除く）
 */
export const onDelete = (documentPath: string, handlerFileName: string) => {
    return db.document(documentPath).onDelete(async (snapshot, context) => {
        const handler: SnapshotHandler = await getHandler(handlerFileName);
        return handler.trigger(snapshot, context);
    });
};

/**
 * @param documentPath - トリガー起点の Firestore ドキュメントのパス
 * @param handlerFileName - "./triggers"直下のファイル名（拡張子除く）
 */
export const onUpdate = (documentPath: string, handlerFileName: string) => {
    return db.document(documentPath).onUpdate(async (change, context) => {
        const handler: ChangeHandler = await getHandler(handlerFileName);
        return handler.trigger(change, context);
    });
};

/**
 * @param handlerFileName - "./triggers"直下のファイル名（拡張子除く）
 */
export const onHttps = (handlerFileName: string) => {
    return https.onRequest(async (req, resp) => {
        const handler: RequestHandler = await getHandler(handlerFileName);
        return handler.trigger(req, resp);
    });
};

export const onRun = (handlerFileName: string) => {
    return functions.region("asia-northeast1").pubsub.schedule('every 3 minutes').onRun(async (_) => {
        const handler = await getHandler(handlerFileName);
        return handler.trigger();
    })
};

