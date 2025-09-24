
// subject student dashboard js

  function redirectToSubject(subject) {
            switch(subject) {
                case 'math':
                    window.location.href = 'math.html';
                    break;
                case 'maths-lit':
                    window.location.href = 'mathlit.html';
                    break;
                case 'accountings':
                    window.location.href = 'accountings.html';
                    break;
                case 'physci':
                    window.location.href = 'physci.html';
                    break;
                case 'tourisms':
                    window.location.href = 'tourisms.html';
                    break;
                case 'agri':
                    window.location.href = 'agri.html';
                    break;
                case 'geography':
                    window.location.href = 'geography.html';
                    break;
                case 'lifesci':
                    window.location.href = 'lifesci.html';
                    break;
                case 'history':
                    window.location.href = 'history.html';
                    break;
                default:
                    alert('Subject page not found!');
            }
        }

