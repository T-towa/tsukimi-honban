// デバイスID関連のユーティリティ関数

/**
 * URLパラメータからdevice_idを取得
 * @returns {string|null} device_id or null
 */
export const getDeviceIdFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search);

  // 'id'パラメータまたは'device_id'パラメータを取得
  const deviceId = urlParams.get('id') || urlParams.get('device_id');

  if (deviceId) {
    // LocalStorageに保存して次回以降も使用可能にする
    localStorage.setItem('device_id', deviceId);
    console.log('✅ URLパラメータからdevice_idを設定:', deviceId);
    return deviceId;
  }

  // URLになければLocalStorageから取得
  const storedId = localStorage.getItem('device_id');
  if (storedId) {
    console.log('📦 LocalStorageからdevice_idを取得:', storedId);
  }
  return storedId;
};

/**
 * LocalStorageに保存されているdevice_idを取得
 * @returns {string|null} device_id or null
 */
export const getStoredDeviceId = () => {
  return localStorage.getItem('device_id');
};

/**
 * device_idをLocalStorageに保存
 * @param {string} deviceId
 */
export const setDeviceId = (deviceId) => {
  if (deviceId) {
    localStorage.setItem('device_id', deviceId);
  }
};

/**
 * device_idをLocalStorageから削除
 */
export const clearDeviceId = () => {
  localStorage.removeItem('device_id');
};

/**
 * device_idが存在するかチェック
 * @returns {boolean}
 */
export const hasDeviceId = () => {
  return !!getDeviceIdFromURL();
};
