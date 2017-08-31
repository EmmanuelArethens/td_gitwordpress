<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title><?php wp_title('|', true, 'left'); ?></title>
<link rel="profile" href="http://gmpg.org/xfn/11" />
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />


<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>

<div id="wrapper">

	<div id="container">

	<header id="branding" role="banner">
    
      <div id="inner-header-wrap">
        
        <div id="inner-header" class="clearfix">
        
            <div id="site-heading">
                <?php if ( get_theme_mod( 'wp_advocate_logo' ) ) : ?>
                <div id="site-logo"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home"><img src="<?php echo esc_url( get_theme_mod( 'wp_advocate_logo' ) ); ?>" alt="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" /></a></div>
                <?php else : ?>
                <div id="site-title"><a href="<?php echo esc_url( home_url( '/' ) ); ?>" title="<?php echo esc_attr( get_bloginfo( 'name', 'display' ) ); ?>" rel="home"><?php bloginfo( 'name' ); ?></a></div>
                <?php endif; ?>
            </div>
            
            <div id="social-media" class="clearfix">
        
        	<?php if ( get_theme_mod( 'wp_advocate_facebook' ) ) : ?>
            <a href="<?php echo esc_url( get_theme_mod( 'wp_advocate_facebook' ) ); ?>" class="social-fb" title="<?php echo esc_url( get_theme_mod( 'wp_advocate_facebook' ) ); ?>"><?php _e('Facebook', 'wp-advocate') ?></a>
            <?php endif; ?>
            
            <?php if ( get_theme_mod( 'wp_advocate_twitter' ) ) : ?>
            <a href="<?php echo esc_url( get_theme_mod( 'wp_advocate_twitter' ) ); ?>" class="social-tw" title="<?php echo esc_url( get_theme_mod( 'wp_advocate_twitter' ) ); ?>"><?php _e('Twitter', 'wp-advocate') ?></a>
            <?php endif; ?>
			
            <?php if ( get_theme_mod( 'wp_advocate_google' ) ) : ?>
            <a href="<?php echo esc_url( get_theme_mod( 'wp_advocate_google' ) ); ?>" class="social-gp" title="<?php echo esc_url( get_theme_mod( 'wp_advocate_google' ) ); ?>"><?php _e('Google+', 'wp-advocate') ?></a>
            <?php endif; ?>
            
            <?php if ( get_theme_mod( 'wp_advocate_pinterest' ) ) : ?>
            <a href="<?php echo esc_url( get_theme_mod( 'wp_advocate_pinterest' ) ); ?>" class="social-pi" title="<?php echo esc_url( get_theme_mod( 'wp_advocate_pinterest' ) ); ?>"><?php _e('Pinterest', 'wp-advocate') ?></a>
            <?php endif; ?>
            
            <?php if ( get_theme_mod( 'wp_advocate_linkedin' ) ) : ?>
            <a href="<?php echo esc_url( get_theme_mod( 'wp_advocate_linkedin' ) ); ?>" class="social-li" title="<?php echo esc_url( get_theme_mod( 'wp_advocate_linkedin' ) ); ?>"><?php _e('Linkedin', 'wp-advocate') ?></a>
            <?php endif; ?>
            
			<?php if ( get_theme_mod( 'wp_advocate_youtube' ) ) : ?>
            <a href="<?php echo esc_url( get_theme_mod( 'wp_advocate_youtube' ) ); ?>" class="social-yt" title="<?php echo esc_url( get_theme_mod( 'wp_advocate_youtube' ) ); ?>"><?php _e('Youtube', 'wp-advocate') ?></a>
            <?php endif; ?>
            
            <?php if ( get_theme_mod( 'wp_advocate_tumblr' ) ) : ?>
            <a href="<?php echo esc_url( get_theme_mod( 'wp_advocate_tumblr' ) ); ?>" class="social-tu" title="<?php echo esc_url( get_theme_mod( 'wp_advocate_tumblr' ) ); ?>"><?php _e('Tumblr', 'wp-advocate') ?></a>
            <?php endif; ?>
            
            <?php if ( get_theme_mod( 'wp_advocate_instagram' ) ) : ?>
            <a href="<?php echo esc_url( get_theme_mod( 'wp_advocate_instagram' ) ); ?>" class="social-in" title="<?php echo esc_url( get_theme_mod( 'wp_advocate_instagram' ) ); ?>"><?php _e('Instagram', 'wp-advocate') ?></a>
            <?php endif; ?>
            
            <?php if ( get_theme_mod( 'wp_advocate_flickr' ) ) : ?>
            <a href="<?php echo esc_url( get_theme_mod( 'wp_advocate_flickr' ) ); ?>" class="social-fl" title="<?php echo esc_url( get_theme_mod( 'wp_advocate_flickr' ) ); ?>"><?php _e('Instagram', 'wp-advocate') ?></a>
            <?php endif; ?>
            
            <?php if ( get_theme_mod( 'wp_advocate_vimeo' ) ) : ?>
            <a href="<?php echo esc_url( get_theme_mod( 'wp_advocate_vimeo' ) ); ?>" class="social-vi" title="<?php echo esc_url( get_theme_mod( 'wp_advocate_vimeo' ) ); ?>"><?php _e('Vimeo', 'wp-advocate') ?></a>
            <?php endif; ?>
            
            <?php if ( get_theme_mod( 'wp_advocate_yelp' ) ) : ?>
            <a href="<?php echo esc_url( get_theme_mod( 'wp_advocate_yelp' ) ); ?>" class="social-ye" title="<?php echo esc_url( get_theme_mod( 'wp_advocate_yelp' ) ); ?>"><?php _e('Yelp', 'wp-advocate') ?></a>
            <?php endif; ?>
            
            <?php if ( get_theme_mod( 'wp_advocate_avvo' ) ) : ?>
            <a href="<?php echo esc_url( get_theme_mod( 'wp_advocate_avvo' ) ); ?>" class="social-av" title="<?php echo esc_url( get_theme_mod( 'wp_advocate_avvo' ) ); ?>"><?php _e('Avvo', 'wp-advocate') ?></a>
            <?php endif; ?>
            
            <?php if ( get_theme_mod( 'wp_advocate_rss' ) ) : ?>
            <a href="<?php echo esc_url( get_theme_mod( 'wp_advocate_rss' ) ); ?>" class="social-rs" title="<?php echo esc_url( get_theme_mod( 'wp_advocate_rss' ) ); ?>"><?php _e('RSS', 'wp-advocate') ?></a>
            <?php endif; ?>
            
            <?php if ( get_theme_mod( 'wp_advocate_email' ) ) : ?>
            <a href="<?php _e('mailto:', 'wp-advocate'); echo sanitize_email( get_theme_mod( 'wp_advocate_email' ) ); ?>" class="social-em" title="<?php _e('mailto:', 'wp-advocate'); echo sanitize_email( get_theme_mod( 'wp_advocate_email' ) ); ?>"><?php _e('Email', 'wp-advocate') ?></a>
            <?php endif; ?>

          </div><!-- .social-media -->
	    </div>
      </div>
      
      <nav id="access" role="navigation">
          <div id="inner-nav">
            <h1 class="assistive-text section-heading"><?php _e( 'Main menu', 'wp-advocate' ); ?></h1>
            <div class="skip-link screen-reader-text"><a href="#content" title="<?php esc_attr_e( 'Skip to content', 'wp-advocate' ); ?>"><?php _e( 'Skip to content', 'wp-advocate' ); ?></a></div>
            <?php wp_advocate_main_nav(); // Adjust using Menus in Wordpress Admin ?>
          </div>
      </nav><!-- #access -->
      
	</header><!-- #branding -->
