use tauri::Emitter;
use tauri::Manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

pub fn register(app: &tauri::AppHandle) -> tauri::Result<()> {
    let shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space);
    app.global_shortcut().on_shortcut(shortcut, |app, _shortcut, event| {
        let payload = if event.state == ShortcutState::Pressed {
            "down"
        } else {
            "up"
        };
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.emit("desktop:ptt", payload);
        }
    })?;
    Ok(())
}
