export type InputState = { up: boolean; down: boolean };

export class InputTracker {
  private state: InputState = { up: false, down: false };
  private onChange?: (s: InputState) => void;
  private onTogglePause?: () => void;
  private keyPush = (e: KeyboardEvent) => this.handleKey(e, true);
  private keyRelease = (e: KeyboardEvent) => this.handleKey(e, false);

  constructor(onChange?: (s: InputState) => void, onTogglePause?: () => void) {
    this.onChange = onChange;
    this.onTogglePause = onTogglePause;
  }

  // register eventlistener
  start() {
    addEventListener("keydown", this.keyPush);
    addEventListener("keyup", this.keyRelease);
  }

  stop() {
    removeEventListener("keydown", this.keyPush);
    removeEventListener("keyup", this.keyRelease);
  }

  get(): InputState {
    return { ...this.state };
  }

  private handleKey(e: KeyboardEvent, pressed: boolean) {
    //This section controll space key state
    if (e.code === "space") {
      if (pressed && !e.repeat) {
        e.preventDefault();
        this.onStart?.();
      }
      return;
    }
    // This section controll paddle key state
    let changed = false;
    if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      // if pressed state isn't equal, change this.state and set up the changed flag to true
      if (this.state.up !== pressed) {
        this.state.up = pressed;
        changed = true;
      }
    } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      // if pressed state isn't equal, change this.state and set up the changed flag to true
      if (this.state.down !== pressed) {
        this.state.down = pressed;
        changed = true;
      }
    } else if (e.code === "Space" || e.key === " ") {
      e.preventDefault();
      if (pressed && !e.repeat) {
        this.onTogglePause?.();
      }
    }
    // pass the current keybord event into onChange method, this parameter is sent to backend api
    if (changed) this.onChange?.(this.get());
  }
}
