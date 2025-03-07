import { useState, useEffect } from 'react';
import {
  doc,
  collection,
  query,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  Query,
  DocumentReference,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirebaseError } from '../lib/errors';

// Hook for real-time document updates
export function useDocument<T = DocumentData>(
  path: string,
  id: string
): {
  data: T | null;
  error: Error | null;
  loading: boolean;
} {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!path || !id) {
      setLoading(false);
      return;
    }

    try {
      const docRef = doc(db, path, id);
      const unsubscribe = onSnapshot(
        docRef,
        (doc) => {
          setLoading(false);
          if (doc.exists()) {
            setData({ id: doc.id, ...doc.data() } as T);
          } else {
            setData(null);
          }
        },
        (err) => {
          setLoading(false);
          setError(handleFirebaseError(err));
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setLoading(false);
      setError(handleFirebaseError(err));
    }
  }, [path, id]);

  return { data, error, loading };
}

// Hook for real-time collection updates
export function useCollection<T = DocumentData>(
  path: string,
  constraints: QueryConstraint[] = []
): {
  data: T[];
  error: Error | null;
  loading: boolean;
} {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    try {
      const collectionRef = collection(db, path);
      const q = query(collectionRef, ...constraints);
      
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setLoading(false);
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          setData(docs);
        },
        (err) => {
          setLoading(false);
          setError(handleFirebaseError(err));
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setLoading(false);
      setError(handleFirebaseError(err));
    }
  }, [path, JSON.stringify(constraints)]);

  return { data, error, loading };
}

// Hook for real-time filtered collection updates
export function useFilteredCollection<T = DocumentData>(
  path: string,
  queryFn: (ref: Query<DocumentData>) => Query<DocumentData>
): {
  data: T[];
  error: Error | null;
  loading: boolean;
} {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    try {
      const collectionRef = collection(db, path);
      const q = queryFn(query(collectionRef));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setLoading(false);
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[];
          setData(docs);
        },
        (err) => {
          setLoading(false);
          setError(handleFirebaseError(err));
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setLoading(false);
      setError(handleFirebaseError(err));
    }
  }, [path]);

  return { data, error, loading };
} 