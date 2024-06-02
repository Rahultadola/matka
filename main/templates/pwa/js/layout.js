import { loginHeader, sideNavigationHTML, footerHTML } from './str_html.js';

export const navLinkDecoration = () => {
  const links = document.getElementsByClassName('nav-link')
  for (var li of links) {
    li.addEventListener('click', (ev) => {
      const lnks = document.getElementsByClassName('nav-link')
      for (var lnk of lnks) {
        lnk.style.borderBottom = 'none';
      }
      ev.target.style.borderBottom = '1px solid #e74b3c';
    })
  }
};

export function toggleHeader() {
  
  const header = document.querySelector('header');
  const newHeader = document.createElement('div')
  newHeader.id = 'login-user-header';
  newHeader.innerHTML = loginHeader;
  header.replaceChild(newHeader, document.querySelector('header').children[0]);  
}

export function handleLayouts(admin) {
  const hash = window.location.hash;
  const container = document.querySelector(".container")
  container.innerHTML = "Loading resources..."

  if ( hash === '#khabar-page' ||  hash === '#rules-page' ||  hash.slice(0,11) === '#funds-page') {
    container.parentElement.style.background = 'linear-gradient(to top, #0000 99%, #1e1a1a 1%)';  
    container.parentElement.style.backgroundAttachment = 'local';

    if(!document.querySelector('#contents').contains(document.querySelector('.admin-mobile'))){
      const admin_details = document.createElement('div');
      admin_details.className = 'admin-mobile';
      admin_details.innerHTML = `<h4>Admin Mobile</h4><h4>${admin.mobile}</h4>`;
      container.parentElement.insertBefore(admin_details, container.parentElement.children[0]) 
    }
  }  else {
    container.parentElement.style.background = '#0000';
    if (document.querySelector('.admin-mobile') != null){
      document.querySelector('.admin-mobile').remove();
    }
  }

  if ( hash === '#rules-page') {
    container.style.gridTemplateColumns = "auto";
  } else if ( hash.slice(0,11) === '#funds-page' || hash.slice(0,9) === '#bet-form' || hash === '#bets-page'|| hash === '#win-history-page') {
    container.style.gridTemplateColumns = "1fr";
    container.style.marginBottom = '3rem';
  } else {
    container.style.gridTemplateColumns = "repeat(auto-fit, minmax(15rem, 1fr))";
  }
}

	
export function addNavEventHandlers(user_mobile) {

	const sideNavigation = document.createElement('nav');
  sideNavigation.id = "side_nav";  
  sideNavigation.innerHTML = sideNavigationHTML;

  sideNavigation.style.transitionDuration = '.5s';
  sideNavigation.style.transform = `translateX(-100vw)`;

  document.querySelector('main').insertBefore(sideNavigation, document.querySelector('main').children[1])
  document.getElementById('nav-mobile').innerHTML = `${user_mobile}`;

  const navCloseArea = document.getElementById('close-side-nav');
  navCloseArea.style.transitionDuration = '.5s';
  navCloseArea.style.opacity = '0';
  navCloseArea.style.transform = `translateX(-${navCloseArea.offsetWidth})`;
	
  document.getElementById('mtk-menu').addEventListener('click', (ev) => {
		sideNavigation.style.transform = `translateX(0px)`;

    setTimeout(() => {
      navCloseArea.style.transform = 'translateX(0)';
      setTimeout(() => {
        navCloseArea.style.opacity = '1';
      }, 200)
    }, 250)
	});

	navCloseArea.addEventListener('click', (ev) => {
    navCloseArea.style.opacity = '0';

    setTimeout(() => {
      navCloseArea.style.transform = `translateX(-${navCloseArea.offsetWidth})`;
      setTimeout(() => {
        sideNavigation.style.transform = `translateX(-100vw)`;
      }, 100)
    }, 250)    
	});

  //Share application
  document.getElementById('app-share-btn').addEventListener('click', async (ev) => {
    const appData = {
      title: "Matka King",
      text: "No.1 matka game play application.",
      url: `https://${window.location.hostname}`
    }

    const canShare = (data) => {
      if (!navigator.share || !navigator.canShare) {
        return false;
      }
      return navigator.canShare(data)
    }

    if (canShare(appData)){
      try {
        await navigator.share(appData)
        alert(`Application shared successfully.`)
      } catch (err) {
        alert(`Application share error : ${err}.`)
      }
    }
  });
}

export function containerOverlayToggler() {
	const overlay = document.getElementById('overlayContent');
	if (window.location.hash.slice(0,9) === '#bet-form') {
		overlay.style.display = 'block';
	} else if (window.location.hash === '#add-fund-page') {
    overlay.innerHTML = '';
    overlay.style.display = 'block';
    overlay.style.backgroundColor = '#fff';
  } else {
		overlay.style.display = 'none';
	}
};

export const addFooter = () => {
  const futr = document.createElement('footer');
    futr.id ="page-footer";
    futr.innerHTML = footerHTML;  
    document.querySelector('main').append(futr);
}

export const footerToggler = () => {
  const links = document.getElementsByClassName('footer-links')
  for (var li of links) {
  	if (window.location.href.includes(li.href)) { //li.href === window.location.href ||  
  	  li.style.color = '#e74b3c';
      li.children[0].children[0].setAttribute('fill', '#e74b3c')
      li.children[0].children[0].setAttribute('stroke', '#e74b3c')
  	} else {
  	  li.style.color = '#d4cbc7';
  	  li.children[0].children[0].setAttribute('fill', '#d4cbc7')
	  li.children[0].children[0].setAttribute('stroke', '#d4cbc7')
  	}
  }

  const hom = document.getElementsByClassName('footer-home')[0];
  if (hom.href === window.location.href){
  	hom.style.boxShadow = "0px 0px 50px #db4938, 0px 0px 10px #db4938";
  } else {
  	hom.style.boxShadow = "none";
  }
};