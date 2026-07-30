/**
 * Native file/camera pickers steal focus from Radix dialogs on iOS/Android.
 * Without a guard the dialog closes, unmounts the input, and the change event is lost.
 */
let activePicks = 0;
let generation = 0;

export function beginFilePick(): number {
  activePicks += 1;
  generation += 1;
  return generation;
}

export function endFilePick(pickId?: number) {
  if (pickId !== undefined && pickId !== generation) return;
  activePicks = Math.max(0, activePicks - 1);
}

export function isFilePickActive(): boolean {
  return activePicks > 0;
}
