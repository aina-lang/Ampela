import { collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";
import { database } from "@/services/firebaseConfig";
import { getAllCycle, addCycleMenstruel } from "@/services/database";

export const uploadCyclesToFirestore = async (userId) => {
  try {
    const cycles = await getAllCycle();
    if (!cycles || cycles.length === 0) return;

    const cyclesRef = collection(database, "users", userId, "cycles");

    const existingQuery = await getDocs(cyclesRef);
    for (const snap of existingQuery.docs) {
      await deleteDoc(snap.ref);
    }

    for (const cycle of cycles) {
      await addDoc(cyclesRef, {
        month: cycle.month,
        ovulationDate: cycle.ovulationDate,
        fecundityPeriodStart: cycle.fecundityPeriodStart,
        fecundityPeriodEnd: cycle.fecundityPeriodEnd,
        startMenstruationDate: cycle.startMenstruationDate,
        endMenstruationDate: cycle.endMenstruationDate,
        nextMenstruationStartDate: cycle.nextMenstruationStartDate,
        nextMenstruationEndDate: cycle.nextMenstruationEndDate,
      });
    }

    console.log(`${cycles.length} cycles uploaded to Firestore`);
  } catch (error) {
    console.error("Error uploading cycles:", error);
  }
};

export const downloadCyclesFromFirestore = async (userId) => {
  try {
    const cyclesRef = collection(database, "users", userId, "cycles");
    const querySnapshot = await getDocs(cyclesRef);

    if (querySnapshot.empty) return;

    const localCycles = await getAllCycle();
    if (localCycles.length > 0) return;

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();
      await addCycleMenstruel(
        data.fecundityPeriodEnd,
        data.fecundityPeriodStart,
        data.month,
        data.startMenstruationDate,
        data.endMenstruationDate,
        data.nextMenstruationStartDate,
        data.nextMenstruationEndDate,
        data.ovulationDate
      );
    }

    console.log(`${querySnapshot.size} cycles downloaded from Firestore`);
  } catch (error) {
    console.error("Error downloading cycles:", error);
  }
};

export const syncCycles = async (userId) => {
  await uploadCyclesToFirestore(userId);
  await downloadCyclesFromFirestore(userId);
};
