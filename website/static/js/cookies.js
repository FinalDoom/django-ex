// JavaScript document

function set_cookie( name, value, expires, path, domain, secure ) {
	document.cookie = name + "=" + escape( value ) +
		( ( expires ) ? ";expires=" + expires.toGMTString() : "" ) +
		( ( path ) ? ";path=" + path : "" ) +
		( ( domain ) ? ";domain=" + domain : "" ) +
		( ( secure ) ? ";secure" : ""
	);
}

function get_cookie( name ) {
	var cookies = document.cookie.split( "; " );
	for ( i = 0; i < cookies.length; ++i ) {
		var crumb = cookies[i].split( '=' );
		if ( crumb[0] == name ) {
			return unescape( crumb[1] );
		}
	}
	return null;
}

function delete_cookie( name ) {
	document.cookie = name + "=;expires=" + ( new Date( 0 ) ).toGMTString();
}
