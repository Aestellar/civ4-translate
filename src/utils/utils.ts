export function getLocalTime(){
          let now = new Date()
          let timeString = now.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      return timeString
}