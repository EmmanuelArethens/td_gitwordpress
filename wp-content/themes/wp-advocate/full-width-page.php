<?php
/**
 * Template Name: Full-width, no sidebar
 * Description: A full-width template with no sidebar
 */
get_header(); ?>

    <div id="content" class="clearfix full-width-content">
        
        <div id="main" class="clearfix" role="main">

				<?php while ( have_posts() ) : the_post(); ?>

				<?php get_template_part( 'content', 'page' ); ?>

				<?php
					// If comments are open or we have at least one comment, load up the comment template
					if ( comments_open() || '0' != get_comments_number() )
						comments_template( '', true );
				?>

				<?php endwhile; // end of the loop. ?>

			</div>
		</div>

<?php get_footer(); ?>