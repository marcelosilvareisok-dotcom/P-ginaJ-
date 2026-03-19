import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, deleteDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db, auth } from '../firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function createPage(data: any) {
  const newDocRef = doc(collection(db, 'pages'));
  try {
    await setDoc(newDocRef, {
      ...data,
      id: newDocRef.id,
      createdAt: serverTimestamp(),
      views: 0,
      published: true,
    });
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'pages');
  }
}

export async function getPage(id: string) {
  try {
    const docRef = doc(db, 'pages', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `pages/${id}`);
  }
}

export async function incrementPageViews(id: string) {
  try {
    const docRef = doc(db, 'pages', id);
    await updateDoc(docRef, {
      views: increment(1)
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `pages/${id}`);
  }
}

export async function getUserPages(userId: string) {
  try {
    const q = query(collection(db, 'pages'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'pages');
  }
}
