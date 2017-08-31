<?php 
/**
 * Template Name: People Profile Template
 * Description: Main Page Template for the "People" Custom Post Type.
 */
get_header(); ?>

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
    

    <div id="content" class="people-main clearfix">
        
        <div id="main" class="clearfix" role="main">
        <?php if (post_type_exists('people')) : ?>
        	<?php 
				if ( get_query_var('paged') ) {
                        $paged = get_query_var('paged');
                } elseif ( get_query_var('page') ) {
                        $paged = get_query_var('page');
                } else {
                        $paged = 1;
                }

				$args = array(
					'orderby' => 'title',
					'order' => 'ASC',
					'post_type' => 'people',
					'people_category' => '',
					'paged' => $paged
				);
				$people_query = new WP_Query($args);
			?>
            
			<?php if ( $people_query->have_posts() ) : ?>
            	<div id="grid-wrap" class="clearfix">
				<?php /* Start the Loop */ ?>
				<?php while ( $people_query->have_posts() ) : $people_query->the_post(); ?>
				  	<div class="grid-box">
                    
					<?php
						/* Include the Post-Format-specific template for the content.
						 * If you want to overload this in a child theme then include a file
						 * called content-___.php (where ___ is the Post Format name) and that will be used instead.
						 */
						get_template_part( 'content', 'people' );
					?>
				  	</div>
				<?php endwhile; ?>
                
                </div>

				<?php if (function_exists("wp_advocate_pagination")) {
							wp_advocate_pagination(); 
				} elseif (function_exists("wp_advocate_content_nav")) { 
							wp_advocate_content_nav( 'nav-below' );
				}?>
                
                <?php wp_reset_postdata(); ?>

			<?php else : ?>

				<article id="post-0" class="post no-results not-found">
					<header class="entry-header">
						<h1 class="entry-title"><?php _e( 'No People Found!', 'wp-advocate' ); ?></h1>
					</header><!-- .entry-header -->
					<div class="noimg"></div>
                    <div class="entry-content post-content">
						<p><?php _e( 'It seems we can&rsquo;t find what you&rsquo;re looking for. Perhaps searching can help.', 'wp-advocate' ); ?></p>
						<?php get_search_form(); ?>
					</div><!-- .entry-content -->
				</article><!-- #post-0 -->

			<?php endif; ?>
            
        <?php else : ?>
        
        	<article id="post-0" class="post no-results not-found">
                <header class="entry-header">
                    <h1 class="entry-title"><?php _e( 'No People Found!', 'wp-advocate' ); ?></h1>
                </header><!-- .entry-header -->
				<div class="noimg"></div>
                <div class="entry-content post-content">
                    <p><?php _e( 'Please make sure that the WP advocate People CPT Plugin is installed and activated.', 'wp-advocate' ); ?></p>
                </div><!-- .entry-content -->
            </article><!-- #post-0 -->
        
        <?php endif; ?>

        </div> <!-- end #main -->

        <?php // get_sidebar(); ?>

    </div> <!-- end #content -->
        
<?php get_footer(); ?>