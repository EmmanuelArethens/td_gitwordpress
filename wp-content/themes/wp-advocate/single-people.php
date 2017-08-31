<?php get_header(); ?>

    <div id="content" class="clearfix">
        
        <div id="main" class="clearfix" role="main">

			<?php while ( have_posts() ) : the_post(); ?>

				<?php get_template_part( 'content', 'single-people' ); ?>
                
                <?php // wp_advocate_content_nav( 'nav-below' ); ?>

			<?php endwhile; // end of the loop. ?>

        </div> <!-- end #main -->

    </div> <!-- end #content -->
        
<?php get_footer(); ?>