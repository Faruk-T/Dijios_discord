mod ptt_shortcut;
mod tray;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            tray::install(app.handle())?;
            ptt_shortcut::register(app.handle())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("dijiOS Connect masaüstü kabuğu açılamadı");
}
