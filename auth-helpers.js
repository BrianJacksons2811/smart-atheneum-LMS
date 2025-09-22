// auth-helpers.js
// Minimal front-end "auth" flags for demo purposes (no names yet).
(function(){
  function setAuth(action, role){
    const p = role === 'teacher' ? 'sa_teacher_' : 'sa_student_';
    localStorage.setItem(p + 'action', action); // 'signup' | 'signin'
    localStorage.setItem(p + 'signed', '1');

    // redirect to the correct single dashboard per role
    const dash = role === 'teacher' ? 'teach-dash.html' : 'Dash-student.html';
    window.location.href = dash;
  }

  window.SAAuth = {
    setAuth,
    popAction(role){
      const p = role === 'teacher' ? 'sa_teacher_' : 'sa_student_';
      const k = p + 'action';
      const v = localStorage.getItem(k);
      localStorage.removeItem(k);
      return v;
    },
    isSigned(role){
      const p = role === 'teacher' ? 'sa_teacher_' : 'sa_student_';
      return localStorage.getItem(p + 'signed') === '1';
    },
    // When you have a real backend, call this after a successful login/signup
    // e.g. SAAuth.setProfileName('student', user.fullName)
    setProfileName(role, name){
      const p = role === 'teacher' ? 'sa_teacher_' : 'sa_student_';
      localStorage.setItem(p + 'profileName', name);
    },
    getProfileName(role){
      const p = role === 'teacher' ? 'sa_teacher_' : 'sa_student_';
      return localStorage.getItem(p + 'profileName') || "";
    },
    signOut(role){
      const p = role === 'teacher' ? 'sa_teacher_' : 'sa_student_';
      localStorage.removeItem(p + 'signed');
      // keep stored name if you want dashboard to remember; otherwise also clear:
      // localStorage.removeItem(p + 'profileName');
    }
  };
})();
