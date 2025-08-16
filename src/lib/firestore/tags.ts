import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { TagDoc } from "@/types/firestore";

export const TAGS_COLLECTION = "tags";

/**
 * Normalizes a tag name into a safe, lowercase, dash-separated Firestore ID.
 * Example: "Binary Search" -> "binary-search"
 */
export function normalizeTagName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export async function upsertTag(tag: TagDoc): Promise<void> {
  const ref = doc(db, TAGS_COLLECTION, tag.id);
  await setDoc(ref, tag, { merge: true }); // merge = update existing fields without overwriting the whole doc
}

export async function getTagById(id: string): Promise<TagDoc | null> {
  const ref = doc(db, TAGS_COLLECTION, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  return snapshot.data() as TagDoc;
}

export async function getAllTags(): Promise<TagDoc[]> {
  const snapshot = await getDocs(collection(db, TAGS_COLLECTION));
  return snapshot.docs.map((docSnap) => docSnap.data() as TagDoc);
}

export async function getOrCreateTag(tagDisplayName: string): Promise<string> {
  const id = normalizeTagName(tagDisplayName);

  const existingTag = await getTagById(id);
  if (!existingTag) {
    await upsertTag({ id, displayName: tagDisplayName });
  }

  return id;
}

export async function getOrCreateTags(displayNames: string[]): Promise<string[]> {
  return Promise.all(displayNames.map((name) => getOrCreateTag(name)));
}