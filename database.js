/* Cliente REST de Supabase: funciona en navegador y en WebView/APK con internet. */
(() => {
  const config = window.AULAYA_SUPABASE || {};
  const baseUrl = String(config.url || '').replace(/\/$/, '');
  const anonKey = String(config.anonKey || '');
  const SESSION_KEY = 'aulaya-supabase-session';

  function isConfigured() { return /^https:\/\/[\w.-]+\.supabase\.co$/.test(baseUrl) && anonKey.length > 20; }
  function readSession() { try { const own = sessionStorage.getItem(SESSION_KEY); if (!own && sessionStorage.getItem(SESSION_KEY + '-out')) return null; return JSON.parse(own || localStorage.getItem(SESSION_KEY) || 'null'); } catch (_) { return null; } }
  function writeSession(session) {
    try {
      if (session) { const raw = JSON.stringify(session); sessionStorage.removeItem(SESSION_KEY + '-out'); sessionStorage.setItem(SESSION_KEY, raw); localStorage.setItem(SESSION_KEY, raw); }
      else { const mine = sessionStorage.getItem(SESSION_KEY); sessionStorage.removeItem(SESSION_KEY); sessionStorage.setItem(SESSION_KEY + '-out', '1'); if (!mine || localStorage.getItem(SESSION_KEY) === mine) localStorage.removeItem(SESSION_KEY); }
    } catch (_) {}
  }

  async function request(path, { method = 'GET', body, token, headers = {} } = {}) {
    if (!isConfigured()) throw new Error('Falta configurar Supabase en supabase-config.js.');
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: { apikey: anonKey, Authorization: `Bearer ${token || anonKey}`, ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    const data = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || data?.error || 'No fue posible conectar con la base de datos.');
    return data;
  }

  async function sessionToken() {
    let session = readSession();
    if (!session?.access_token) return null;
    if (session.expires_at && Date.now() > session.expires_at - 60000 && session.refresh_token) {
      const refreshed = await request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: session.refresh_token } });
      session = { ...refreshed, expires_at: Date.now() + (refreshed.expires_in || 3600) * 1000 };
      writeSession(session);
    }
    return session.access_token;
  }

  async function authenticate(mode, email, password, metadata = {}) {
    const path = mode === 'signup' ? '/auth/v1/signup' : '/auth/v1/token?grant_type=password';
    const body = mode === 'signup' ? { email, password, data: metadata } : { email, password };
    const result = await request(path, { method: 'POST', body });
    if (result?.access_token) writeSession({ ...result, expires_at: Date.now() + (result.expires_in || 3600) * 1000 });
    return result;
  }

  async function saveProfile(profile) {
    const token = await sessionToken();
    if (!token) return;
    await request('/rest/v1/profiles?on_conflict=id', {
      method: 'POST', token, headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: { ...profile, updated_at: new Date().toISOString() }
    });
  }

  async function loadProfile() {
    const token = await sessionToken();
    if (!token) return null;
    const user = await request('/auth/v1/user', { token });
    const rows = await request(`/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=*`, { token });
    return { user, profile: rows?.[0] || null };
  }

  async function findEligibleStudents(classId, search) {
    const token = await sessionToken();
    if (!token) throw new Error('Inicia sesión con internet para buscar estudiantes.');
    return request('/rest/v1/rpc/find_eligible_students', { method: 'POST', token, body: { p_class_id: classId, p_search: search } });
  }

  async function addStudentToClass(classId, studentId) {
    const token = await sessionToken();
    if (!token) throw new Error('Inicia sesión con internet para agregar estudiantes.');
    const rows = await request('/rest/v1/rpc/add_student_to_class', { method: 'POST', token, body: { p_class_id: classId, p_student_id: studentId } });
    return rows?.[0] || null;
  }

  async function loadClassProgress() {
    const token = await sessionToken();
    if (!token) return [];
    return request('/rest/v1/rpc/get_class_progress', { method: 'POST', token, body: {} });
  }

  async function loadMyClassActivities() {
    const token = await sessionToken();
    if (!token) return null;
    return request('/rest/v1/rpc/get_my_class_activities', { method: 'POST', token, body: {} });
  }

  async function reportLowLessonProgress(lessonKey, lessonName, subjectName, progress) {
    const token = await sessionToken();
    if (!token) throw new Error('El aviso se sincronizará cuando vuelvas a conectarte.');
    return request('/rest/v1/rpc/report_low_lesson_progress', {
      method: 'POST', token,
      body: { p_lesson_key: lessonKey, p_lesson_name: lessonName, p_subject_name: subjectName, p_progress: progress }
    });
  }

  async function loadTeacherNotifications() {
    const token = await sessionToken();
    if (!token) throw new Error('Inicia sesión para cargar las notificaciones.');
    return request('/rest/v1/teacher_notifications?select=id,student_id,teacher_class_id,lesson_key,student_name,lesson_name,subject_name,progress,created_at,read_at&order=created_at.desc&limit=100', { token });
  }

  async function markTeacherNotificationsRead() {
    const token = await sessionToken();
    if (!token) return;
    await request(`/rest/v1/teacher_notifications?teacher_id=eq.${encodeURIComponent(userId())}&read_at=is.null`, {
      method: 'PATCH', token, headers: { Prefer: 'return=minimal' }, body: { read_at: new Date().toISOString() }
    });
  }

  function encodedStoragePath(path) { return String(path).split('/').map(encodeURIComponent).join('/'); }
  async function uploadClassVideo(path, file) {
    const token = await sessionToken();
    if (!token) throw new Error('Inicia sesión con internet para subir el video.');
    const response = await fetch(`${baseUrl}/storage/v1/object/class-videos/${encodedStoragePath(path)}`, {
      method: 'POST', headers: { apikey: anonKey, Authorization: `Bearer ${token}`, 'Content-Type': file.type || 'application/octet-stream', 'x-upsert': 'false' }, body: file
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) { const raw = String(data?.message || data?.error || ''); throw new Error(/row-level security|unauthorized|not allowed/i.test(raw) ? 'No se pudo subir: tu cuenta no tiene permiso para esta clase. Cierra sesión y vuelve a entrar como docente.' : /too large|exceeded|size/i.test(raw) ? 'El archivo pesa más de 20 MB. Elige uno más liviano o comprímelo.' : /mime|type/i.test(raw) ? 'Este tipo de archivo no se puede subir. Prueba con PDF, imagen, video o documento.' : 'No se pudo subir el archivo. Verifica tu conexión e inténtalo de nuevo.'); }
    return path;
  }
  async function deleteClassVideo(path) {
    const token = await sessionToken();
    if (!token) return;
    const response = await fetch(`${baseUrl}/storage/v1/object/class-videos/${encodedStoragePath(path)}`, { method: 'DELETE', headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
    if (!response.ok) console.warn('No se pudo limpiar el archivo de video después de un error.');
  }
  async function addBankQuestions(rows) {
    const token = await sessionToken();
    if (!token) throw new Error('Sin sesión');
    await request('/rest/v1/question_bank?on_conflict=teacher_id,grade,subject,topic,question', { method: 'POST', token, headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' }, body: rows.map((r) => ({ ...r, teacher_id: userId() })) });
  }
  async function loadQuestionBankSummary() {
    const token = await sessionToken();
    if (!token) return null;
    return request('/rest/v1/rpc/question_bank_summary', { method: 'POST', token, body: {} });
  }
  async function deleteClassMaterial(id) {
    const token = await sessionToken();
    if (!token) throw new Error('Necesitas internet para quitar el archivo.');
    await request(`/rest/v1/class_materials?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', token, headers: { Prefer: 'return=minimal' } });
  }
  async function createClassMaterial(material) {
    const token = await sessionToken();
    if (!token) throw new Error('Inicia sesión con internet para compartir el video.');
    const rows = await request('/rest/v1/class_materials?select=*', { method: 'POST', token, headers: { Prefer: 'return=representation' }, body: material });
    return rows?.[0] || null;
  }
  async function deleteTeacherClass(classId) {
    const token = await sessionToken();
    if (!token) throw new Error('Inicia sesión con internet para eliminar la clase.');
    const params = new URLSearchParams({ select: 'file_path', teacher_id: `eq.${userId()}`, teacher_class_id: `eq.${classId}` });
    const materials = await request(`/rest/v1/class_materials?${params}`, { token }).catch(() => []);
    for (const material of materials || []) await deleteClassVideo(material.file_path);
    await request('/rest/v1/rpc/delete_teacher_class', { method: 'POST', token, body: { p_class_id: classId } });
  }
  async function loadClassMaterials(grade, subject, topic) {
    const token = await sessionToken();
    if (!token) return [];
    const params = new URLSearchParams({ select: '*', grade: `eq.${grade}`, subject: `eq.${subject}`, topic: `eq.${topic}`, order: 'created_at.desc' });
    return request(`/rest/v1/class_materials?${params}`, { token });
  }
  async function downloadClassVideo(path) {
    const token = await sessionToken();
    if (!token) throw new Error('Conéctate e inicia sesión para descargar este video.');
    const response = await fetch(`${baseUrl}/storage/v1/object/authenticated/class-videos/${encodedStoragePath(path)}`, { headers: { apikey: anonKey, Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error('No se pudo descargar el video. Revisa tu conexión e inténtalo de nuevo.');
    return response.blob();
  }

  async function signOut() {
    const token = await sessionToken();
    try { if (token) await request('/auth/v1/logout', { method: 'POST', token }); } finally { writeSession(null); }
  }

  async function requestPasswordReset(email) {
    const redirectTo = `${location.origin}${location.pathname}`;
    return request(`/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, { method: 'POST', body: { email } });
  }

  async function resendSignupConfirmation(email) {
    const redirectTo = `${location.origin}${location.pathname}`;
    return request(`/auth/v1/resend?redirect_to=${encodeURIComponent(redirectTo)}`, { method: 'POST', body: { type: 'signup', email } });
  }

  async function updatePassword(password) {
    const token = await sessionToken();
    if (!token) throw new Error('El enlace de recuperación venció. Solicita uno nuevo.');
    const result = await request('/auth/v1/user', { method: 'PUT', token, body: { password } });
    const session = readSession();
    if (session && result?.id) writeSession({ ...session, user: { ...session.user, ...result } });
    return result;
  }

  function consumeRecoveryRedirect() {
    const params = new URLSearchParams(location.hash.replace(/^#/, ''));
    if (params.get('type') !== 'recovery' || !params.get('access_token')) return false;
    writeSession({ access_token: params.get('access_token'), refresh_token: params.get('refresh_token'), expires_at: Date.now() + Number(params.get('expires_in') || 3600) * 1000, token_type: params.get('token_type') || 'bearer' });
    history.replaceState(null, '', `${location.pathname}${location.search}`);
    return true;
  }

  function userId() { return readSession()?.user?.id || null; }
  window.aulayaDb = { isConfigured, authenticate, saveProfile, loadProfile, findEligibleStudents, addStudentToClass, loadMyClassActivities, loadClassProgress, deleteTeacherClass, reportLowLessonProgress, loadTeacherNotifications, markTeacherNotificationsRead, uploadClassVideo, deleteClassVideo, deleteClassMaterial, addBankQuestions, loadQuestionBankSummary, createClassMaterial, loadClassMaterials, downloadClassVideo, signOut, userId, requestPasswordReset, resendSignupConfirmation, updatePassword, consumeRecoveryRedirect };
})();
