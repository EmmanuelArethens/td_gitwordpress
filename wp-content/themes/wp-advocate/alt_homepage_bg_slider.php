<?php
/**
 * Template Name: Alt_Homepage, w/ Background Image Slider
 * Description: Alternative homepage template that displays gallery images as background image slider, and with footer widgets.
 */
get_header(); ?>

	<?php if( has_shortcode( $post->post_content, 'gallery' ) ) : ?>

	<div id="slide-wrap">

              <div class="cycle-slideshow" data-cycle-fx="fadeOut" data-cycle-slides="> div.slides" <?php
                  	if ( get_theme_mod('wp_advocate_slider_timeout') ) {
						$slider_timeout = wp_kses_post( get_theme_mod('wp_advocate_slider_timeout') );
						echo 'data-cycle-timeout="' . $slider_timeout . '000"';
					} else {
						echo 'data-cycle-timeout="5000"';
					}
				  ?> <?php
                  	if ( get_theme_mod('wp_advocate_slider_speed') ) {
						$slider_speed = wp_kses_post( get_theme_mod('wp_advocate_slider_speed') );
						echo 'data-cycle-speed="' . $slider_speed . '000"';
					} else {
						echo 'data-cycle-speed="1000"';
					}
				  ?> data-cycle-prev="#sliderprev" data-cycle-next="#slidernext">

            <?php while ( have_posts() ) : the_post();  ?>
			 
			
            
            <?php 
			  		$gallery = get_post_gallery( $post, false );
					$ids = explode( ",", $gallery['ids'] );
					
					foreach( $ids as $id ) {
						$title = get_post_field('post_title', $id);
						$meta = get_post_field('post_excerpt', $id);
						$link = wp_get_attachment_url( $id );
						$image  = wp_get_attachment_image( $id, "full");	

			?>
            <div class="slides">  
            
              <div id="post-<?php the_ID(); ?>" <?php post_class('post-theme'); ?>>
              
                  <div class="slide-thumb"><?php echo $image; ?></div>
   					
              </div>
            
            </div><!-- .slides -->  
            <?php } ?>
            
 			<?php endwhile; ?>
            
            <?php wp_reset_postdata(); ?>
            
          </div>

    </div>
    
    <?php endif; ?>
    
    <?php while ( have_posts() ) : the_post(); ?>
    <?php
		if (get_theme_mod('wp_advocate_intro_bg')) {
			$intro_class = 'intro-copy-box-wrap-nobg';
		} else {
			$intro_class = 'intro-copy-box-wrap';
		}
	?>
    <div class="<?php echo $intro_class; ?>">
      <div class="intro-copy-box">
        <?php get_template_part( 'content', 'intro' ); ?>
      </div>
    </div>
    <?php endwhile; // end of the loop. ?>
    
    
    <?php if ( is_active_sidebar( 'sidebar-alt' ) ) : ?>
    
      <div id="alt-sidebar-wrap" class="clearfix">
        <div id="alt-sidebar" class="widget-area" role="complementary">
        	<?php dynamic_sidebar('sidebar-alt'); ?>
        </div>
      </div>
    	
    <?php endif; ?>
    
        
<?php get_footer(); ?>