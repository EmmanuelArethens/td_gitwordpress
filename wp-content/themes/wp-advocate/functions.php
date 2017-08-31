<?php
/**
 * Sets up the theme and provides some helper functions. Some helper functions
 * are used in the theme as custom template tags. Others are attached to action and
 * filter hooks in WordPress to change core functionality.
 *
 *
 * For more information on hooks, actions, and filters, see http://codex.wordpress.org/Plugin_API.
 */


if ( ! function_exists( 'wp_advocate_setup' ) ):
/**
 * Sets up theme defaults and registers support for various WordPress features.
 */
function wp_advocate_setup() {
		
	/**
	 * Make theme available for translation
	 * Translations can be filed in the /languages/ directory
	 */
	load_theme_textdomain( 'wp-advocate', get_template_directory() . '/languages' );

	/**
	 * Add default posts and comments RSS feed links to head
	 */
	add_theme_support( 'automatic-feed-links' );

	/**
	 * This theme uses wp_nav_menu() in one location.
	 */
	register_nav_menus( array(
		'primary' => __( 'Primary Menu', 'wp-advocate' ),
		'secondary' => __('Footer Menu', 'wp-advocate')
	) );

	add_theme_support('post-thumbnails'); 
	// This theme styles the visual editor with editor-style.css to match the theme style.
	add_editor_style();
	
	
	// custom backgrounds
	$wp_advocate_custom_background = array(
		// Background color default
		'default-color' => '40464f',
		// Background image default
		'default-image' => '',
		'wp-head-callback' => '_custom_background_cb',

	);
	add_theme_support('custom-background', $wp_advocate_custom_background);

	
	// adding post format support
	add_theme_support( 'post-formats', 
		array( 
			'aside', /* Typically styled without a title. Similar to a Facebook note update */
			'gallery', /* A gallery of images. Post will likely contain a gallery shortcode and will have image attachments */
			'link', /* A link to another site. Themes may wish to use the first link tag in the post content as the external link for that post. An alternative approach could be if the post consists only of a URL, then that will be the URL and the title (post_title) will be the name attached to the anchor for it */
			'image', /* A single image. The first <img /> tag in the post could be considered the image. Alternatively, if the post consists only of a URL, that will be the image URL and the title of the post (post_title) will be the title attribute for the image */
			'quote', /* A quotation. Probably will contain a blockquote holding the quote content. Alternatively, the quote may be just the content, with the source/author being the title */
			'status', /*A short status update, similar to a Twitter status update */
			'video', /* A single video. The first <video /> tag or object/embed in the post content could be considered the video. Alternatively, if the post consists only of a URL, that will be the video URL. May also contain the video as an attachment to the post, if video support is enabled on the blog (like via a plugin) */
			'audio', /* An audio file. Could be used for Podcasting */
			'chat' /* A chat transcript */
		)
	);
}
endif;
add_action( 'after_setup_theme', 'wp_advocate_setup' );



/**
 * Set the content width based on the theme's design and stylesheet.
 */
if ( ! function_exists( 'wp_advocate_content_width' ) ) :
	function wp_advocate_content_width() {
		global $content_width;
		if (!isset($content_width))
			$content_width = 550; /* pixels */
	}
endif;
add_action( 'after_setup_theme', 'wp_advocate_content_width' );


/**
 * Title filter 
 */
if ( ! function_exists( 'wp_advocate_filter_wp_title' ) ) :
	function wp_advocate_filter_wp_title( $old_title, $sep, $sep_location ) {
		
		if ( is_feed() ) return $old_title;
	
		$site_name = get_bloginfo( 'name' );
		$site_description = get_bloginfo( 'description' );
		// add padding to the sep
		$ssep = ' ' . $sep . ' ';
		
		if ( $site_description && ( is_home() || is_front_page() ) ) {
			return $site_name . ' | ' . $site_description;
		} else {
			// find the type of index page this is
			if( is_category() ) $insert = $ssep . __( 'Category', 'wp-advocate' );
			elseif( is_tag() ) $insert = $ssep . __( 'Tag', 'wp-advocate' );
			elseif( is_author() ) $insert = $ssep . __( 'Author', 'wp-advocate' );
			elseif( is_year() || is_month() || is_day() ) $insert = $ssep . __( 'Archives', 'wp-advocate' );
			else $insert = NULL;
			 
			// get the page number we're on (index)
			if( get_query_var( 'paged' ) )
			$num = $ssep . __( 'Page ', 'wp-advocate' ) . get_query_var( 'paged' );
			 
			// get the page number we're on (multipage post)
			elseif( get_query_var( 'page' ) )
			$num = $ssep . __( 'Page ', 'wp-advocate' ) . get_query_var( 'page' );
			 
			// else
			else $num = NULL;
			 
			// concoct and return new title
			return $site_name . $insert . $old_title . $num;
			
		}
	
	}
endif;
// call our custom wp_title filter, with normal (10) priority, and 3 args
add_filter( 'wp_title', 'wp_advocate_filter_wp_title', 10, 3 );


/*******************************************************************
* These are settings for the Theme Customizer in the admin panel. 
*******************************************************************/
if ( ! function_exists( 'wp_advocate_theme_customizer' ) ) :
	function wp_advocate_theme_customizer( $wp_customize ) {
		
		$wp_customize->remove_section( 'title_tagline');
		
		/* logo option */
		$wp_customize->add_section( 'wp_advocate_logo_section' , array(
			'title'       => __( 'Site Logo', 'wp-advocate' ),
			'priority'    => 31,
			'description' => __( 'Upload a logo to replace the default site name in the header', 'wp-advocate' ),
		) );
		
		$wp_customize->add_setting( 'wp_advocate_logo', array (
			'sanitize_callback' => 'esc_url_raw',
		) );
		
		$wp_customize->add_control( new WP_Customize_Image_Control( $wp_customize, 'wp_advocate_logo', array(
			'label'    => __( 'Choose your logo (ideal width is 100-300px and ideal height is 40-100px)', 'wp-advocate' ),
			'section'  => 'wp_advocate_logo_section',
			'settings' => 'wp_advocate_logo',
		) ) );

		/* link color */
		$wp_customize->add_setting( 'wp_advocate_theme_color', array (
			'default' => '#be7a19',
			'sanitize_callback' => 'sanitize_hex_color',
		) );
		
		$wp_customize->add_control( new WP_Customize_Color_Control( $wp_customize, 'wp_advocate_theme_color', array(
			'label'    => __( 'Link Color Option', 'wp-advocate' ),
			'section'  => 'colors',
			'settings' => 'wp_advocate_theme_color',
			'priority' => 101,
		) ) );
		
		/* social media option */
		$wp_customize->add_section( 'wp_advocate_social_section' , array(
			'title'       => __( 'Social Media Icons', 'wp-advocate' ),
			'priority'    => 32,
			'description' => __( 'Optional social media buttons in the header', 'wp-advocate' ),
		) );
		
		$wp_customize->add_setting( 'wp_advocate_facebook', array (
			'sanitize_callback' => 'esc_url_raw',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_facebook', array(
			'label'    => __( 'Enter your Facebook url', 'wp-advocate' ),
			'section'  => 'wp_advocate_social_section',
			'settings' => 'wp_advocate_facebook',
			'priority'    => 101,
		) ) );
	
		$wp_customize->add_setting( 'wp_advocate_twitter', array (
			'sanitize_callback' => 'esc_url_raw',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_twitter', array(
			'label'    => __( 'Enter your Twitter url', 'wp-advocate' ),
			'section'  => 'wp_advocate_social_section',
			'settings' => 'wp_advocate_twitter',
			'priority'    => 102,
		) ) );
		
		$wp_customize->add_setting( 'wp_advocate_google', array (
			'sanitize_callback' => 'esc_url_raw',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_google', array(
			'label'    => __( 'Enter your Google+ url', 'wp-advocate' ),
			'section'  => 'wp_advocate_social_section',
			'settings' => 'wp_advocate_google',
			'priority'    => 103,
		) ) );
		
		$wp_customize->add_setting( 'wp_advocate_pinterest', array (
			'sanitize_callback' => 'esc_url_raw',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_pinterest', array(
			'label'    => __( 'Enter your Pinterest url', 'wp-advocate' ),
			'section'  => 'wp_advocate_social_section',
			'settings' => 'wp_advocate_pinterest',
			'priority'    => 104,
		) ) );
		
		$wp_customize->add_setting( 'wp_advocate_linkedin', array (
			'sanitize_callback' => 'esc_url_raw',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_linkedin', array(
			'label'    => __( 'Enter your Linkedin url', 'wp-advocate' ),
			'section'  => 'wp_advocate_social_section',
			'settings' => 'wp_advocate_linkedin',
			'priority'    => 105,
		) ) );
		
		$wp_customize->add_setting( 'wp_advocate_youtube', array (
			'sanitize_callback' => 'esc_url_raw',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_youtube', array(
			'label'    => __( 'Enter your Youtube url', 'wp-advocate' ),
			'section'  => 'wp_advocate_social_section',
			'settings' => 'wp_advocate_youtube',
			'priority'    => 106,
		) ) );
		
		$wp_customize->add_setting( 'wp_advocate_tumblr', array (
			'sanitize_callback' => 'esc_url_raw',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_tumblr', array(
			'label'    => __( 'Enter your Tumblr url', 'wp-advocate' ),
			'section'  => 'wp_advocate_social_section',
			'settings' => 'wp_advocate_tumblr',
			'priority'    => 107,
		) ) );
		
		$wp_customize->add_setting( 'wp_advocate_instagram', array (
			'sanitize_callback' => 'esc_url_raw',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_instagram', array(
			'label'    => __( 'Enter your Instagram url', 'wp-advocate' ),
			'section'  => 'wp_advocate_social_section',
			'settings' => 'wp_advocate_instagram',
			'priority'    => 108,
		) ) );
		
		$wp_customize->add_setting( 'wp_advocate_flickr', array (
			'sanitize_callback' => 'esc_url_raw',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_flickr', array(
			'label'    => __( 'Enter your Flickr url', 'wp-advocate' ),
			'section'  => 'wp_advocate_social_section',
			'settings' => 'wp_advocate_flickr',
			'priority'    => 109,
		) ) );
		
		$wp_customize->add_setting( 'wp_advocate_vimeo', array (
			'sanitize_callback' => 'esc_url_raw',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_vimeo', array(
			'label'    => __( 'Enter your Vimeo url', 'wp-advocate' ),
			'section'  => 'wp_advocate_social_section',
			'settings' => 'wp_advocate_vimeo',
			'priority'    => 110,
		) ) );
		
		$wp_customize->add_setting( 'wp_advocate_yelp', array (
			'sanitize_callback' => 'esc_url_raw',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_yelp', array(
			'label'    => __( 'Enter your Yelp url', 'wp-advocate' ),
			'section'  => 'wp_advocate_social_section',
			'settings' => 'wp_advocate_yelp',
			'priority'    => 111,
		) ) );
		
		$wp_customize->add_setting( 'wp_advocate_avvo', array (
			'sanitize_callback' => 'esc_url_raw',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_avvo', array(
			'label'    => __( 'Enter your Avvo url', 'wp-advocate' ),
			'section'  => 'wp_advocate_social_section',
			'settings' => 'wp_advocate_avvo',
			'priority'    => 112,
		) ) );
		
		$wp_customize->add_setting( 'wp_advocate_rss', array (
			'sanitize_callback' => 'esc_url_raw',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_rss', array(
			'label'    => __( 'Enter your RSS url', 'wp-advocate' ),
			'section'  => 'wp_advocate_social_section',
			'settings' => 'wp_advocate_rss',
			'priority'    => 113,
		) ) );
		
		$wp_customize->add_setting( 'wp_advocate_email', array (
			'sanitize_callback' => 'sanitize_email',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_email', array(
			'label'    => __( 'Enter your email address', 'wp-advocate' ),
			'section'  => 'wp_advocate_social_section',
			'settings' => 'wp_advocate_email',
			'priority'    => 114,
		) ) );
		
		/* disable the semi transparent bg for the intro text */
		$wp_customize->add_section( 'wp_advocate_intro_bg_section' , array(
			'title'       => __( 'Disable Intro Text Background', 'wp-advocate' ),
			'priority'    => 33,
			'description' => __( 'Option to disable the semi transparent background for the Intro Text on the Alt Homepage and People Post Type main page template.', 'wp-advocate' ),
		) );
		
		$wp_customize->add_setting( 'wp_advocate_intro_bg', array (
			'sanitize_callback' => 'wp_advocate_sanitize_checkbox',
		) );
		
		 $wp_customize->add_control('intro_bg', array(
			'settings' => 'wp_advocate_intro_bg',
			'label' => __('Disable the background?', 'wp-advocate'),
			'section' => 'wp_advocate_intro_bg_section',
			'type' => 'checkbox',
		));
		
		/* slider options */
		
		$wp_customize->add_section( 'wp_advocate_slider_section' , array(
			'title'       => __( 'Slider Options', 'wp-advocate' ),
			'priority'    => 34,
			'description' => __( 'Adjust the behavior of the background image slider on Alt_Homepage.', 'wp-advocate' ),
		) );
		
		$wp_customize->add_setting( 'wp_advocate_slider_speed', array (
			'sanitize_callback' => 'wp_advocate_sanitize_integer',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_slider_speed', array(
			'label'    => __( 'Animation Speed in Seconds', 'wp-advocate' ),
			'section'  => 'wp_advocate_slider_section',
			'settings' => 'wp_advocate_slider_speed',
		) ) );
		
		$wp_customize->add_setting( 'wp_advocate_slider_timeout', array (
			'sanitize_callback' => 'wp_advocate_sanitize_integer',
		) );
		
		$wp_customize->add_control( new WP_Customize_Control( $wp_customize, 'wp_advocate_slider_timeout', array(
			'label'    => __( 'Time Out (Interval) in Seconds', 'wp-advocate' ),
			'section'  => 'wp_advocate_slider_section',
			'settings' => 'wp_advocate_slider_timeout',
		) ) );
		
	}
endif;
add_action('customize_register', 'wp_advocate_theme_customizer');

/**
 * Sanitize checkbox
 */
if ( ! function_exists( 'wp_advocate_sanitize_checkbox' ) ) :
	function wp_advocate_sanitize_checkbox( $input ) {
		if ( $input == 1 ) {
			return 1;
		} else {
			return '';
		}
	}
endif;

/**
 * Sanitize integer input
 */
if ( ! function_exists( 'wp_advocate_sanitize_integer' ) ) :
	function wp_advocate_sanitize_integer( $input ) {
		return absint($input);
	}
endif;


/**
* Apply Color Scheme
*/
if ( ! function_exists( 'wp_advocate_apply_color' ) ) :
  function wp_advocate_apply_color() {
	 if ( get_theme_mod('wp_advocate_theme_color') ) {
	?>
	<style id="color-settings">
	<?php if ( get_theme_mod('wp_advocate_theme_color') ) : ?>
		
		a, a:visited, .people-job, .entry-title a:hover {
			color: <?php echo get_theme_mod('wp_advocate_theme_color'); ?>;
		}
		
	<?php endif; ?>
	</style>
	<?php	  
	} 
  }
endif;
add_action( 'wp_head', 'wp_advocate_apply_color' );


/**
 * Get our wp_nav_menu() fallback, wp_page_menu(), to show a home link.
 */
if ( ! function_exists( 'wp_advocate_main_nav' ) ) :
function wp_advocate_main_nav() {
	// display the wp3 menu if available
    wp_nav_menu( 
    	array( 
    		'theme_location' => 'primary', /* where in the theme it's assigned */
    		'container_class' => 'menu', /* div container class */
    		'fallback_cb' => 'wp_advocate_main_nav_fallback' /* menu fallback */
    	)
    );
}
endif;

if ( ! function_exists( 'wp_advocate_main_nav_fallback' ) ) :
	function wp_advocate_main_nav_fallback() { wp_page_menu( 'show_home=Home&container_class=menu' ); }
endif;

if ( ! function_exists( 'wp_advocate_footer_nav' ) ) :
function wp_advocate_footer_nav() {
	// display the wp3 menu if available
    wp_nav_menu( 
    	array( 
    		'theme_location' => 'secondary', /* where in the theme it's assigned */
    		'container_class' => 'footer-menu', /* container class */
    		'fallback_cb' => false,
    	)
    );
}
endif;



if ( ! function_exists( 'wp_advocate_page_menu_args' ) ) :
	function wp_advocate_page_menu_args( $args ) {
		$args['show_home'] = true;
		return $args;
	}
endif;
add_filter( 'wp_page_menu_args', 'wp_advocate_page_menu_args' );

/**
 * Register widgetized area and update sidebar with default widgets
 */
function wp_advocate_widgets_init() {
	register_sidebar( array(
		'name' => __( 'Blog Sidebar', 'wp-advocate' ),
		'id' => 'sidebar-right',
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget' => "</aside>",
		'before_title' => '<div class="widget-title">',
		'after_title' => '</div>',
	) );
	
	register_sidebar( array(
		'name' => __( 'Page Sidebar', 'wp-advocate' ),
		'id' => 'sidebar-page',
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget' => "</aside>",
		'before_title' => '<div class="widget-title">',
		'after_title' => '</div>',
	) );
	
	register_sidebar( array(
		'name' => __( 'Alt_Homepage Sidebar', 'wp-advocate' ),
		'id' => 'sidebar-alt',
		'before_widget' => '<aside id="%1$s" class="widget %2$s">',
		'after_widget' => "</aside>",
		'before_title' => '<div class="widget-title">',
		'after_title' => '</div>',
	) );
}
add_action( 'widgets_init', 'wp_advocate_widgets_init' );

if ( ! function_exists( 'wp_advocate_content_nav' ) ):
/**
 * Display navigation to next/previous pages when applicable
 */
function wp_advocate_content_nav( $nav_id ) {
	global $wp_query;

	?>
	<nav id="<?php echo $nav_id; ?>">
		<h1 class="assistive-text section-heading"><?php _e( 'Post navigation', 'wp-advocate' ); ?></h1>

	<?php if ( is_single() ) : // navigation links for single posts ?>

		<?php previous_post_link( '<div class="nav-previous">%link</div>', '<span class="meta-nav">' . _x( '&larr; Previous Post', 'Previous post link', 'wp-advocate' ) . '</span>' ); ?>
		<?php next_post_link( '<div class="nav-next">%link</div>', '<span class="meta-nav">' . _x( 'Next Post &rarr;', 'Next post link', 'wp-advocate' ) . '</span>' ); ?>

	<?php elseif ( $wp_query->max_num_pages > 1 && ( is_home() || is_archive() || is_search() ) ) : // navigation links for home, archive, and search pages ?>

		<?php if ( get_next_posts_link() ) : ?>
		<div class="nav-previous"><?php next_posts_link( __( '<span class="meta-nav">&larr;</span> Older posts', 'wp-advocate' ) ); ?></div>
		<?php endif; ?>

		<?php if ( get_previous_posts_link() ) : ?>
		<div class="nav-next"><?php previous_posts_link( __( 'Newer posts <span class="meta-nav">&rarr;</span>', 'wp-advocate' ) ); ?></div>
		<?php endif; ?>

	<?php endif; ?>

	</nav><!-- #<?php echo $nav_id; ?> -->
	<?php
}
endif;


if ( ! function_exists( 'wp_advocate_comment' ) ) :
/**
 * Template for comments and pingbacks.
 */
function wp_advocate_comment( $comment, $args, $depth ) {
	$GLOBALS['comment'] = $comment;
	switch ( $comment->comment_type ) :
		case 'pingback' :
		case 'trackback' :
	?>
	<li class="post pingback">
		<p><?php _e( 'Pingback:', 'wp-advocate' ); ?> <?php comment_author_link(); ?><?php edit_comment_link( __( '(Edit)', 'wp-advocate' ), ' ' ); ?></p>
	<?php
			break;
		default :
	?>
	<li <?php comment_class(); ?> id="li-comment-<?php comment_ID(); ?>">
		<article id="comment-<?php comment_ID(); ?>">
			<footer class="clearfix comment-head">
				<div class="comment-author vcard">
					<?php echo get_avatar( $comment, 50 ); ?>
					<?php printf( __( '%s', 'wp-advocate' ), sprintf( '<cite class="fn">%s</cite>', get_comment_author_link() ) ); ?>
				</div><!-- .comment-author .vcard -->

				<div class="comment-meta commentmetadata">
					<a href="<?php echo esc_url( get_comment_link( $comment->comment_ID ) ); ?>"><time pubdate datetime="<?php comment_time( 'c' ); ?>">
					<?php
						/* translators: 1: date, 2: time */
						printf( __( '%1$s at %2$s', 'wp-advocate' ), get_comment_date(), get_comment_time() ); ?>
					</time></a>
					<?php edit_comment_link( __( '(Edit)', 'wp-advocate' ), ' ' );
					?>
				</div><!-- .comment-meta .commentmetadata -->
			</footer>

			<div class="comment-content">
            	<?php if ( $comment->comment_approved == '0' ) : ?>
					<h6><em><?php _e( 'Your comment is awaiting moderation.', 'wp-advocate' ); ?></em></h6>
					<br />
				<?php endif; ?>
				<?php comment_text(); ?>
            </div>

			<div class="reply">
				<?php comment_reply_link( array_merge( $args, array( 'depth' => $depth, 'max_depth' => $args['max_depth'] ) ) ); ?>
			</div><!-- .reply -->
		</article><!-- #comment-## -->

	<?php
			break;
	endswitch;
}
endif;

if ( ! function_exists( 'wp_advocate_posted_on' ) ) :
/**
 * Prints HTML with meta information for the current post-date/time and author.
 */
function wp_advocate_posted_on() {
	printf( __( '<span class="sep meta-on">Posted on </span><a href="%1$s" title="%2$s" rel="bookmark"><time class="entry-date" datetime="%3$s">%4$s</time></a><span class="byline"> <span class="sep meta-by">by</span> <span class="author vcard"><a class="url fn n" href="%5$s" title="%6$s" rel="author">%7$s</a></span></span>', 'wp-advocate' ),
		esc_url( get_permalink() ),
		esc_attr( get_the_time() ),
		esc_attr( get_the_date( 'c' ) ),
		esc_html( get_the_date() ),
		esc_url( get_author_posts_url( get_the_author_meta( 'ID' ) ) ),
		esc_attr( sprintf( __( 'View all posts by %s', 'wp-advocate' ), get_the_author() ) ),
		esc_html( get_the_author() )
	);
}
endif;

/**
 * Adds custom classes to the array of body classes.
 */
if ( ! function_exists( 'wp_advocate_body_classes' ) ) :
	function wp_advocate_body_classes( $classes ) {
		// Adds a class of single-author to blogs with only 1 published author
		if ( ! is_multi_author() ) {
			$classes[] = 'single-author';
		}
	
		return $classes;
	}
endif;
add_filter( 'body_class', 'wp_advocate_body_classes' );

/**
 * Returns true if a blog has more than 1 category
 */
if ( ! function_exists( 'wp_advocate_categorized_blog' ) ) :
function wp_advocate_categorized_blog() {
	if ( false === ( $all_the_cool_cats = get_transient( 'all_the_cool_cats' ) ) ) {
		// Create an array of all the categories that are attached to posts
		$all_the_cool_cats = get_categories( array(
			'hide_empty' => 1,
		) );

		// Count the number of categories that are attached to the posts
		$all_the_cool_cats = count( $all_the_cool_cats );

		set_transient( 'all_the_cool_cats', $all_the_cool_cats );
	}

	if ( '1' != $all_the_cool_cats ) {
		// This blog has more than 1 category so wp_advocate_categorized_blog should return true
		return true;
	} else {
		// This blog has only 1 category so wp_advocate_categorized_blog should return false
		return false;
	}
}
endif;
/**
 * Flush out the transients used in wp_advocate_categorized_blog
 */
if ( ! function_exists( 'wp_advocate_category_transient_flusher' ) ) :
	function wp_advocate_category_transient_flusher() {
		// Like, beat it. Dig?
		delete_transient( 'all_the_cool_cats' );
	}
endif;
add_action( 'edit_category', 'wp_advocate_category_transient_flusher' );
add_action( 'save_post', 'wp_advocate_category_transient_flusher' );

/**
 * Remove WP default gallery styling
 */
add_filter( 'use_default_gallery_style', '__return_false' );



/**
 * The Pagination Function
 */
if ( ! function_exists( 'wp_advocate_pagination' ) ) :
	function wp_advocate_pagination() {
	
		global $wp_query; 
		
		$big = 999999999;
		  
		$total_pages = $wp_query->max_num_pages;  
		  
		if ($total_pages > 1){  
		  
		  $current_page = max(1, get_query_var('paged'));
			
		  echo '<div class="pagination">';  
			
		  echo paginate_links(array(  
			  'base' => str_replace( $big, '%#%', esc_url( get_pagenum_link( $big ) ) ),  
			  'current' => $current_page,  
			  'total' => $total_pages,  
			  'prev_text' => __('&lsaquo; Prev', 'wp-advocate'),  
			  'next_text' => __('Next &rsaquo;', 'wp-advocate')  
			));  
		  
		  echo '</div>';  
			
		}
	
	}
endif;

/**
 * Add "Untitled" for posts without title, 
 */
function wp_advocate_post_title($title) {
	if ($title == '') {
		return __('Untitled', 'wp-advocate');
	} else {
		return $title;
	}
}
add_filter('the_title', 'wp_advocate_post_title');

/**
 * Fix for W3C validation
 */
if ( ! function_exists( 'wp_advocate_w3c_valid_rel' ) ) :
	function wp_advocate_w3c_valid_rel( $text ) {
		$text = str_replace('rel="category tag"', 'rel="tag"', $text); return $text; 
	}
endif;
add_filter( 'the_category', 'wp_advocate_w3c_valid_rel' );

/**
 * Excerpt
 */
if ( ! function_exists( 'wp_advocate_excerpt' ) ) :
	function wp_advocate_excerpt($limit) {
		$excerpt = explode(' ', get_the_excerpt(), $limit);
		if (count($excerpt)>=$limit) {
		array_pop($excerpt);
		$excerpt = implode(" ",$excerpt).'...';
		} else {
		$excerpt = implode(" ",$excerpt);
		}	
		$excerpt = preg_replace('`\[[^\]]*\]`','',$excerpt);
		return $excerpt;
	}
endif;

/**
 * Modernizr functions
 */
if ( ! function_exists( 'wp_advocate_modernizr_addclass' ) ) :
	function wp_advocate_modernizr_addclass($output) {
		return $output . ' class="no-js"';
	}
endif;
add_filter('language_attributes', 'wp_advocate_modernizr_addclass');

if ( ! function_exists( 'wp_advocate_modernizr_script' ) ) :
	function wp_advocate_modernizr_script() {
		wp_enqueue_script( 'modernizr', get_template_directory_uri() . '/library/js/modernizr-2.6.2.min.js', false, '2.6.2');
	}  
endif;  
add_action('wp_enqueue_scripts', 'wp_advocate_modernizr_script');


/**
 * Get Embed Video for post format video
 */
if ( ! function_exists('wp_advocate_featured_video') ) :
	function wp_advocate_featured_video( &$content ) {
		$url = trim( array_shift( explode( "\n", $content ) ) );
		$w = get_option( 'embed_size_w' );
		if ( !is_single() )
		$url = str_replace( '448', $w, $url );
		
		if ( ( 0 === strpos( $url, 'http://' ) ) || ( 0 === strpos( $url, '//' ) ) ) {
			 echo apply_filters( 'the_content', $url );
			 $content = trim( str_replace( $url, '', $content ) ); 
			 } else if ( preg_match ( '#^<(script|iframe|embed|object)#i', $url ) ) {
			 $h = get_option( 'embed_size_h' );
			 if ( !empty( $h ) ) {
			 if ( $w === $h ) $h = ceil( $w * 0.75 );
			
			 $url = preg_replace( 
			 array( '#height="[0-9]+?"#i', '#height=[0-9]+?#i' ), 
			 array( sprintf( 'height="%d"', $h ), sprintf( 'height=%d', $h ) ), 
			 $url 
			 );
		 }
		
		echo $url;
			$content = trim( str_replace( $url, '', $content ) ); 
		}
	}
endif;


/**
 * Enqueue scripts & styles
 */
function wp_advocate_custom_scripts() {
	wp_register_script( 'imagesloaded', get_template_directory_uri() . '/library/js/imagesloaded.pkgd.min.js');
	wp_register_script( 'cycle2', get_template_directory_uri() . '/library/js/jquery.cycle2.min.js' );
	if ( is_singular() && comments_open() && get_option( 'thread_comments' ) ) {
			wp_enqueue_script( 'comment-reply' );
	}
	wp_enqueue_script( 'wp_advocate_custom_js', get_template_directory_uri() . '/library/js/scripts.js', array( 'jquery', 'imagesloaded', 'cycle2', 'jquery-masonry' ), '1.0.0' );
	wp_enqueue_style( 'wp_advocate_style', get_stylesheet_uri() );
}
add_action('wp_enqueue_scripts', 'wp_advocate_custom_scripts');



/**
 *
 * This script will prompt the users to install the plugin recommended to
 * enable custom post type for this theme.
 *
 * @package	   TGM-Plugin-Activation
 * @subpackage Example
 * @version	   2.3.6
 * @author	   Thomas Griffin <thomas@thomasgriffinmedia.com>
 * @author	   Gary Jones <gamajo@gamajo.com>
 * @copyright  Copyright (c) 2012, Thomas Griffin
 * @license	   http://opensource.org/licenses/gpl-2.0.php GPL v2 or later
 * @link       https://github.com/thomasgriffin/TGM-Plugin-Activation
 */

/**
 * Include the TGM_Plugin_Activation class.
 */
require_once dirname( __FILE__ ) . '/library/class/class-tgm-plugin-activation.php';

add_action( 'tgmpa_register', 'wp_advocate_register_recommended_plugins' );
/**
 * Register the recommended plugins for this theme.
 *
 * The variable passed to tgmpa_register_plugins() should be an array of plugin
 * arrays.
 *
 * This function is hooked into tgmpa_init, which is fired within the
 * TGM_Plugin_Activation class constructor.
 */
function wp_advocate_register_recommended_plugins() {

	/**
	 * Array of plugin arrays. Required keys are name and slug.
	 * If the source is NOT from the .org repo, then source is also required.
	 */
	$plugins = array(

		// This is an example of how to include a plugin from the WordPress Plugin Repository
		array(
			'name'     		=> 'People Profile CPT', // The plugin name
			'slug'     		=> 'people-profile-cpt', // The plugin slug (typically the folder name)
			'required' 		=> false, // If false, the plugin is only 'recommended' instead of required
		),

	);

	// Change this to your theme text domain, used for internationalising strings
	$theme_text_domain = 'wp-advocate';

	/**
	 * Array of configuration settings. Amend each line as needed.
	 * If you want the default strings to be available under your own theme domain,
	 * leave the strings uncommented.
	 * Some of the strings are added into a sprintf, so see the comments at the
	 * end of each line for what each argument will be.
	 */
	$config = array(
		'domain'       		=> $theme_text_domain,         		// Text domain - likely want to be the same as your theme.
		'default_path' 		=> '',                         		// Default absolute path to pre-packaged plugins
		//'parent_menu_slug' 	=> 'themes.php', 					// Default parent menu slug
		//'parent_url_slug' 	=> 'themes.php', 					// Default parent URL slug
		'menu'         		=> 'install-recommended-plugins', 	// Menu slug
		'has_notices'      	=> true,                       		// Show admin notices or not
		'is_automatic'    	=> true,					   		// Automatically activate plugins after installation or not
		'message' 			=> '',								// Message to output right before the plugins table
		'strings'      		=> array(
			'page_title'                       			=> __( 'Install Recommended Plugins', 'wp-advocate' ),
			'menu_title'                       			=> __( 'Install Plugins', 'wp-advocate' ),
			'installing'                       			=> __( 'Installing Plugin: %s', 'wp-advocate' ), // %1$s = plugin name
			'oops'                             			=> __( 'Something went wrong with the plugin API.', 'wp-advocate' ),
			'notice_can_install_required'     			=> _n_noop( 'To enable the "Poeple" custom post type, this theme recommends the following plugin: %1$s.', 'This theme recommends the following plugins: %1$s.' , 'wp-advocate'), // %1$s = plugin name(s)
			'notice_can_install_recommended'			=> _n_noop( 'This theme recommends the following plugin: %1$s.', 'This theme recommends the following plugins: %1$s.' , 'wp-advocate'), // %1$s = plugin name(s)
			'notice_cannot_install'  					=> _n_noop( 'Sorry, but you do not have the correct permissions to install the %s plugin. Contact the administrator of this site for help on getting the plugin installed.', 'Sorry, but you do not have the correct permissions to install the %s plugins. Contact the administrator of this site for help on getting the plugins installed.' , 'wp-advocate'), // %1$s = plugin name(s)
			'notice_can_activate_required'    			=> _n_noop( 'The following recommended plugin is currently inactive: %1$s.', 'The following recommended plugins are currently inactive: %1$s.' , 'wp-advocate'), // %1$s = plugin name(s)
			'notice_can_activate_recommended'			=> _n_noop( 'The following recommended plugin is currently inactive: %1$s.', 'The following recommended plugins are currently inactive: %1$s.' , 'wp-advocate'), // %1$s = plugin name(s)
			'notice_cannot_activate' 					=> _n_noop( 'Sorry, but you do not have the correct permissions to activate the %s plugin. Contact the administrator of this site for help on getting the plugin activated.', 'Sorry, but you do not have the correct permissions to activate the %s plugins. Contact the administrator of this site for help on getting the plugins activated.' , 'wp-advocate'), // %1$s = plugin name(s)
			'notice_ask_to_update' 						=> _n_noop( 'The following plugin needs to be updated to its latest version to ensure maximum compatibility with this theme: %1$s.', 'The following plugins need to be updated to their latest version to ensure maximum compatibility with this theme: %1$s.' , 'wp-advocate'), // %1$s = plugin name(s)
			'notice_cannot_update' 						=> _n_noop( 'Sorry, but you do not have the correct permissions to update the %s plugin. Contact the administrator of this site for help on getting the plugin updated.', 'Sorry, but you do not have the correct permissions to update the %s plugins. Contact the administrator of this site for help on getting the plugins updated.' , 'wp-advocate'), // %1$s = plugin name(s)
			'install_link' 					  			=> _n_noop( 'Begin installing plugin', 'Begin installing plugins' , 'wp-advocate'),
			'activate_link' 				  			=> _n_noop( 'Activate installed plugin', 'Activate installed plugins' , 'wp-advocate'),
			'return'                           			=> __( 'Return to Recommended Plugins Installer', 'wp-advocate' ),
			'plugin_activated'                 			=> __( 'Plugin activated successfully.', 'wp-advocate' ),
			'complete' 									=> __( 'All plugins installed and activated successfully. %s', 'wp-advocate' ), // %1$s = dashboard link
			'nag_type'									=> 'updated' // Determines admin notice type - can only be 'updated' or 'error'
		)
	);

	tgmpa( $plugins, $config );

}

?>