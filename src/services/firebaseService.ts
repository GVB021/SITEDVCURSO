import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  getDocFromServer,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const firebaseService = {
  async testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if(error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration. ");
      }
    }
  },

  async getBanners() {
    const path = 'banners';
    try {
      const q = query(collection(db, path), orderBy('id', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getModules() {
    const path = 'modules';
    try {
      const q = query(collection(db, path), orderBy('num', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getTeachers() {
    const path = 'teachers';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getLearnings() {
    const path = 'learnings';
    try {
      const q = query(collection(db, path), orderBy('id', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getTestimonials() {
    const path = 'testimonials';
    try {
      const q = query(collection(db, path), orderBy('id', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getFAQs() {
    const path = 'faqs';
    try {
      const q = query(collection(db, path), orderBy('id', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async createEnrollment(enrollment: any) {
    const path = 'enrollments';
    try {
      const docRef = await addDoc(collection(db, path), {
        ...enrollment,
        created_at: serverTimestamp()
      });
      return { id: docRef.id, ...enrollment };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async getSettings() {
    const path = 'settings/global';
    try {
      const docSnap = await getDoc(doc(db, path));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // Auth Methods
  async signIn(email: string, password: string) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      throw error;
    }
  },

  async signOut() {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw error;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  // Student Specific Data
  async getStudentProfile(userId: string) {
    const path = `profiles/${userId}`;
    try {
      const docSnap = await getDoc(doc(db, path));
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async getStudentEnrollments(userId: string) {
    const path = 'enrollments';
    try {
      const q = query(collection(db, path), where('email', '==', auth.currentUser?.email));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getStudentActivity(userId: string) {
    const path = 'student_activity';
    try {
      const q = query(collection(db, path), where('student_id', '==', userId), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // Admin Methods
  async getAllStudents() {
    const path = 'profiles';
    try {
      const q = query(collection(db, path), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getAllEnrollments() {
    const path = 'enrollments';
    try {
      const q = query(collection(db, path), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getAllActivity() {
    const path = 'student_activity';
    try {
      const q = query(collection(db, path), orderBy('created_at', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async updateStudentProfile(id: string, profile: any) {
    const path = `profiles/${id}`;
    try {
      await updateDoc(doc(db, path), profile);
      return { id, ...profile };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteBanner(id: string) {
    const path = `banners/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updateBanner(id: string, banner: any) {
    const path = `banners/${id}`;
    try {
      await updateDoc(doc(db, path), banner);
      return { id, ...banner };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createBanner(banner: any) {
    const path = 'banners';
    try {
      const docRef = await addDoc(collection(db, path), banner);
      return { id: docRef.id, ...banner };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateModule(id: string, module: any) {
    const path = `modules/${id}`;
    try {
      await updateDoc(doc(db, path), module);
      return { id, ...module };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createModule(module: any) {
    const path = 'modules';
    try {
      const docRef = await addDoc(collection(db, path), module);
      return { id: docRef.id, ...module };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteModule(id: string) {
    const path = `modules/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updateLearning(id: string, learning: any) {
    const path = `learnings/${id}`;
    try {
      await updateDoc(doc(db, path), learning);
      return { id, ...learning };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createLearning(learning: any) {
    const path = 'learnings';
    try {
      const docRef = await addDoc(collection(db, path), learning);
      return { id: docRef.id, ...learning };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteLearning(id: string) {
    const path = `learnings/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updateTestimonial(id: string, testimonial: any) {
    const path = `testimonials/${id}`;
    try {
      await updateDoc(doc(db, path), testimonial);
      return { id, ...testimonial };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createTestimonial(testimonial: any) {
    const path = 'testimonials';
    try {
      const docRef = await addDoc(collection(db, path), testimonial);
      return { id: docRef.id, ...testimonial };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteTestimonial(id: string) {
    const path = `testimonials/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updateFAQ(id: string, faq: any) {
    const path = `faqs/${id}`;
    try {
      await updateDoc(doc(db, path), faq);
      return { id, ...faq };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createFAQ(faq: any) {
    const path = 'faqs';
    try {
      const docRef = await addDoc(collection(db, path), faq);
      return { id: docRef.id, ...faq };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteFAQ(id: string) {
    const path = `faqs/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async deleteEnrollment(id: string) {
    const path = `enrollments/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updateTeacher(id: string, teacher: any) {
    const path = `teachers/${id}`;
    try {
      await updateDoc(doc(db, path), teacher);
      return { id, ...teacher };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async createTeacher(teacher: any) {
    const path = 'teachers';
    try {
      const docRef = await addDoc(collection(db, path), teacher);
      return { id: docRef.id, ...teacher };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async deleteTeacher(id: string) {
    const path = `teachers/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  async updateSettings(settings: any) {
    const path = 'settings/global';
    try {
      await setDoc(doc(db, path), settings, { merge: true });
      return settings;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateEnrollmentStatus(id: string, status: string) {
    const path = `enrollments/${id}`;
    try {
      await updateDoc(doc(db, path), { status });
      return { id, status };
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async getSiteData() {
    try {
      const [banners, modules, teachers, learnings, testimonials, faqs, settings] = await Promise.all([
        this.getBanners(),
        this.getModules(),
        this.getTeachers(),
        this.getLearnings(),
        this.getTestimonials(),
        this.getFAQs(),
        this.getSettings()
      ]);

      return {
        banners: banners || [],
        modules: modules || [],
        teachers: teachers || [],
        learnings: learnings || [],
        testimonials: testimonials || [],
        faqs: faqs || [],
        settings: settings || {}
      };
    } catch (error) {
      console.error('Error fetching site data from Firebase:', error);
      return null;
    }
  }
};
